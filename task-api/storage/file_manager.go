package storage

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"syscall"
	"time"
)

// FileManager handles file operations with proper locking
type FileManager struct {
	dataDir    string
	lockFile   string
	mu         sync.RWMutex
	fileLock   *os.File
}

// NewFileManager creates a new file manager for the specified data directory
func NewFileManager(dataDir string) *FileManager {
	return &FileManager{
		dataDir:  dataDir,
		lockFile: filepath.Join(dataDir, ".lock"),
	}
}

// ensureDataDir creates the data directory if it doesn't exist
func (fm *FileManager) ensureDataDir() error {
	if err := os.MkdirAll(fm.dataDir, 0755); err != nil {
		return fmt.Errorf("failed to create data directory: %w", err)
	}
	
	backupDir := filepath.Join(fm.dataDir, "backups")
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return fmt.Errorf("failed to create backup directory: %w", err)
	}
	
	return nil
}

// Lock acquires a file lock to prevent concurrent access
func (fm *FileManager) Lock() error {
	fm.mu.Lock()
	defer fm.mu.Unlock()
	
	if err := fm.ensureDataDir(); err != nil {
		return err
	}
	
	if fm.fileLock != nil {
		return nil // Already locked
	}
	
	lockFile, err := os.OpenFile(fm.lockFile, os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open lock file: %w", err)
	}
	
	// Try to acquire exclusive lock with timeout
	err = fm.acquireLockWithTimeout(lockFile, 5*time.Second)
	if err != nil {
		lockFile.Close()
		return err
	}
	
	fm.fileLock = lockFile
	return nil
}

// Unlock releases the file lock
func (fm *FileManager) Unlock() error {
	fm.mu.Lock()
	defer fm.mu.Unlock()
	
	if fm.fileLock == nil {
		return nil // Not locked
	}
	
	// Release the lock
	err := syscall.Flock(int(fm.fileLock.Fd()), syscall.LOCK_UN)
	if err != nil {
		fm.fileLock.Close()
		fm.fileLock = nil
		return fmt.Errorf("failed to release file lock: %w", err)
	}
	
	// Close the lock file
	err = fm.fileLock.Close()
	fm.fileLock = nil
	
	return err
}

// acquireLockWithTimeout attempts to acquire a file lock with timeout
func (fm *FileManager) acquireLockWithTimeout(file *os.File, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	
	for time.Now().Before(deadline) {
		err := syscall.Flock(int(file.Fd()), syscall.LOCK_EX|syscall.LOCK_NB)
		if err == nil {
			return nil // Lock acquired
		}
		
		if err != syscall.EWOULDBLOCK {
			return fmt.Errorf("failed to acquire file lock: %w", err)
		}
		
		// Wait a bit before retrying
		time.Sleep(10 * time.Millisecond)
	}
	
	return errors.New("timeout acquiring file lock")
}

// ReadFile reads data from a file with proper error handling
func (fm *FileManager) ReadFile(filename string) ([]byte, error) {
	if filename == "" {
		return nil, errors.New("filename cannot be empty")
	}
	
	filePath := filepath.Join(fm.dataDir, filename)
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, os.ErrNotExist
	}
	
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %w", filename, err)
	}
	
	return data, nil
}

// WriteFile writes data to a file atomically with proper permissions
func (fm *FileManager) WriteFile(filename string, data []byte) error {
	if filename == "" {
		return errors.New("filename cannot be empty")
	}
	
	if err := fm.ensureDataDir(); err != nil {
		return err
	}
	
	filePath := filepath.Join(fm.dataDir, filename)
	tempPath := filePath + ".tmp"
	
	// Write to temporary file first
	err := os.WriteFile(tempPath, data, 0600) // Restrictive permissions for encrypted data
	if err != nil {
		return fmt.Errorf("failed to write temporary file: %w", err)
	}
	
	// Atomically rename to final name
	err = os.Rename(tempPath, filePath)
	if err != nil {
		os.Remove(tempPath) // Clean up temp file on failure
		return fmt.Errorf("failed to rename temporary file: %w", err)
	}
	
	return nil
}

// CreateBackup creates a backup of the specified file with timestamp
func (fm *FileManager) CreateBackup(filename string) (string, error) {
	if filename == "" {
		return "", errors.New("filename cannot be empty")
	}
	
	sourceFile := filepath.Join(fm.dataDir, filename)
	
	// Check if source file exists
	if _, err := os.Stat(sourceFile); os.IsNotExist(err) {
		return "", errors.New("source file does not exist")
	}
	
	// Create backup filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	backupName := fmt.Sprintf("%s_backup_%s.enc", 
		filename[:len(filename)-4], // Remove .enc extension
		timestamp)
	backupPath := filepath.Join(fm.dataDir, "backups", backupName)
	
	// Read source file
	data, err := os.ReadFile(sourceFile)
	if err != nil {
		return "", fmt.Errorf("failed to read source file: %w", err)
	}
	
	// Write backup file
	err = os.WriteFile(backupPath, data, 0600)
	if err != nil {
		return "", fmt.Errorf("failed to write backup file: %w", err)
	}
	
	return backupName, nil
}

// ListBackups returns a list of backup files
func (fm *FileManager) ListBackups() ([]string, error) {
	backupDir := filepath.Join(fm.dataDir, "backups")
	
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil // No backup directory yet
		}
		return nil, fmt.Errorf("failed to read backup directory: %w", err)
	}
	
	var backups []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".enc" {
			backups = append(backups, entry.Name())
		}
	}
	
	return backups, nil
}

// DeleteOldBackups removes backup files older than the specified number of days
func (fm *FileManager) DeleteOldBackups(retentionDays int) error {
	if retentionDays <= 0 {
		return errors.New("retention days must be positive")
	}
	
	backupDir := filepath.Join(fm.dataDir, "backups")
	cutoffTime := time.Now().AddDate(0, 0, -retentionDays)
	
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // No backup directory
		}
		return fmt.Errorf("failed to read backup directory: %w", err)
	}
	
	var deletedCount int
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".enc" {
			continue
		}
		
		info, err := entry.Info()
		if err != nil {
			continue
		}
		
		if info.ModTime().Before(cutoffTime) {
			filePath := filepath.Join(backupDir, entry.Name())
			if err := os.Remove(filePath); err == nil {
				deletedCount++
			}
		}
	}
	
	return nil
}

// FileExists checks if a file exists in the data directory
func (fm *FileManager) FileExists(filename string) bool {
	if filename == "" {
		return false
	}
	
	filePath := filepath.Join(fm.dataDir, filename)
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}