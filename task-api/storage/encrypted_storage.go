package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
)

const (
	// Default configuration
	DefaultDataFile      = "tasks.enc"
	DefaultRetentionDays = 30
)

// EncryptedStorage provides encrypted file storage for tasks
type EncryptedStorage struct {
	fileManager   *FileManager
	cryptoService *CryptoService
	dataFile      string
	retentionDays int
}

// NewEncryptedStorage creates a new encrypted storage instance
func NewEncryptedStorage(dataDir, encryptionKey string) *EncryptedStorage {
	return &EncryptedStorage{
		fileManager:   NewFileManager(dataDir),
		cryptoService: NewCryptoService(encryptionKey),
		dataFile:      DefaultDataFile,
		retentionDays: DefaultRetentionDays,
	}
}

// SetRetentionDays sets the backup retention period
func (es *EncryptedStorage) SetRetentionDays(days int) {
	if days > 0 {
		es.retentionDays = days
	}
}

// LoadData loads and decrypts data from the storage file
func (es *EncryptedStorage) LoadData() ([]byte, error) {
	if err := es.fileManager.Lock(); err != nil {
		return nil, fmt.Errorf("failed to acquire lock: %w", err)
	}
	defer func() {
		if unlockErr := es.fileManager.Unlock(); unlockErr != nil {
			log.Printf("Warning: failed to release lock: %v", unlockErr)
		}
	}()

	// Check if data file exists
	if !es.fileManager.FileExists(es.dataFile) {
		return []byte("[]"), nil // Return empty JSON array for new storage
	}

	// Read encrypted data from file
	encryptedData, err := es.fileManager.ReadFile(es.dataFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read encrypted data: %w", err)
	}

	// Decrypt the data
	decryptedData, err := es.cryptoService.Decrypt(encryptedData)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt data: %w", err)
	}

	return decryptedData, nil
}

// SaveData encrypts and saves data to the storage file
func (es *EncryptedStorage) SaveData(data []byte) error {
	if len(data) == 0 {
		return errors.New("data cannot be empty")
	}

	// Validate JSON format
	var jsonCheck interface{}
	if err := json.Unmarshal(data, &jsonCheck); err != nil {
		return fmt.Errorf("invalid JSON data: %w", err)
	}

	if err := es.fileManager.Lock(); err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}
	defer func() {
		if unlockErr := es.fileManager.Unlock(); unlockErr != nil {
			log.Printf("Warning: failed to release lock: %v", unlockErr)
		}
	}()

	// Create backup before saving new data
	if es.fileManager.FileExists(es.dataFile) {
		backupName, err := es.fileManager.CreateBackup(es.dataFile)
		if err != nil {
			log.Printf("Warning: failed to create backup: %v", err)
		} else {
			log.Printf("Created backup: %s", backupName)
		}
	}

	// Encrypt the data
	encryptedData, err := es.cryptoService.Encrypt(data)
	if err != nil {
		return fmt.Errorf("failed to encrypt data: %w", err)
	}

	// Write encrypted data to file
	if err := es.fileManager.WriteFile(es.dataFile, encryptedData); err != nil {
		return fmt.Errorf("failed to write encrypted data: %w", err)
	}

	// Clean up old backups
	if err := es.fileManager.DeleteOldBackups(es.retentionDays); err != nil {
		log.Printf("Warning: failed to clean up old backups: %v", err)
	}

	return nil
}

// CreateManualBackup creates a manual backup of the current data
func (es *EncryptedStorage) CreateManualBackup() (string, error) {
	if err := es.fileManager.Lock(); err != nil {
		return "", fmt.Errorf("failed to acquire lock: %w", err)
	}
	defer func() {
		if unlockErr := es.fileManager.Unlock(); unlockErr != nil {
			log.Printf("Warning: failed to release lock: %v", unlockErr)
		}
	}()

	if !es.fileManager.FileExists(es.dataFile) {
		return "", errors.New("no data file exists to backup")
	}

	backupName, err := es.fileManager.CreateBackup(es.dataFile)
	if err != nil {
		return "", fmt.Errorf("failed to create manual backup: %w", err)
	}

	return backupName, nil
}

// ListBackups returns a list of available backup files
func (es *EncryptedStorage) ListBackups() ([]string, error) {
	return es.fileManager.ListBackups()
}

// RestoreFromBackup restores data from a specified backup file
func (es *EncryptedStorage) RestoreFromBackup(backupName string) error {
	if backupName == "" {
		return errors.New("backup name cannot be empty")
	}

	if err := es.fileManager.Lock(); err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}
	defer func() {
		if unlockErr := es.fileManager.Unlock(); unlockErr != nil {
			log.Printf("Warning: failed to release lock: %v", unlockErr)
		}
	}()

	// Read backup file
	backupPath := fmt.Sprintf("backups/%s", backupName)
	backupData, err := es.fileManager.ReadFile(backupPath)
	if err != nil {
		return fmt.Errorf("failed to read backup file: %w", err)
	}

	// Validate that the backup can be decrypted
	_, err = es.cryptoService.Decrypt(backupData)
	if err != nil {
		return fmt.Errorf("backup file is corrupted or encrypted with different key: %w", err)
	}

	// Create a backup of current data before restoring
	if es.fileManager.FileExists(es.dataFile) {
		currentBackup, err := es.fileManager.CreateBackup(es.dataFile)
		if err != nil {
			log.Printf("Warning: failed to backup current data: %v", err)
		} else {
			log.Printf("Created backup of current data: %s", currentBackup)
		}
	}

	// Restore the backup data
	if err := es.fileManager.WriteFile(es.dataFile, backupData); err != nil {
		return fmt.Errorf("failed to restore backup: %w", err)
	}

	return nil
}

// ValidateEncryptionKey checks if the provided key can decrypt existing data
func (es *EncryptedStorage) ValidateEncryptionKey() error {
	if !es.fileManager.FileExists(es.dataFile) {
		return nil // No existing data to validate against
	}

	encryptedData, err := es.fileManager.ReadFile(es.dataFile)
	if err != nil {
		return fmt.Errorf("failed to read data file for validation: %w", err)
	}

	return es.cryptoService.ValidatePassword(encryptedData)
}

// GetStorageInfo returns information about the storage system
func (es *EncryptedStorage) GetStorageInfo() map[string]interface{} {
	info := map[string]interface{}{
		"data_file_exists": es.fileManager.FileExists(es.dataFile),
		"retention_days":   es.retentionDays,
	}

	// Get backup count
	backups, err := es.fileManager.ListBackups()
	if err != nil {
		info["backup_count"] = 0
		info["backup_error"] = err.Error()
	} else {
		info["backup_count"] = len(backups)
	}

	// Get file size if exists
	if es.fileManager.FileExists(es.dataFile) {
		encryptedData, err := es.fileManager.ReadFile(es.dataFile)
		if err == nil {
			info["file_size_bytes"] = len(encryptedData)
		}
	}

	return info
}

// Initialize prepares the storage system for first use
func (es *EncryptedStorage) Initialize() error {
	// Test encryption key by attempting to encrypt/decrypt test data
	testData := []byte(`{"test": true}`)
	encrypted, err := es.cryptoService.Encrypt(testData)
	if err != nil {
		return fmt.Errorf("failed to test encryption: %w", err)
	}

	decrypted, err := es.cryptoService.Decrypt(encrypted)
	if err != nil {
		return fmt.Errorf("failed to test decryption: %w", err)
	}

	if string(decrypted) != string(testData) {
		return errors.New("encryption/decryption test failed")
	}

	// Validate existing data if present
	if err := es.ValidateEncryptionKey(); err != nil {
		return fmt.Errorf("encryption key validation failed: %w", err)
	}

	return nil
}