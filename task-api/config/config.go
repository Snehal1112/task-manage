package config

import (
	"errors"
	"log"
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	// Server configuration
	Port    string
	GinMode string
	
	// Encryption configuration
	EncryptionKey string
	
	// Storage configuration
	DataDir              string
	BackupRetentionDays  int
	
	// CORS configuration
	CORSAllowedOrigins []string
	
	// Logging configuration
	LogLevel string
}

// LoadConfig loads configuration from environment variables with defaults
func LoadConfig() (*Config, error) {
	cfg := &Config{
		Port:                getEnvWithDefault("PORT", "8080"),
		GinMode:             getEnvWithDefault("GIN_MODE", "debug"),
		DataDir:             getEnvWithDefault("DATA_DIR", "./data"),
		BackupRetentionDays: getEnvIntWithDefault("BACKUP_RETENTION_DAYS", 30),
		CORSAllowedOrigins:  getEnvSliceWithDefault("CORS_ALLOWED_ORIGINS", []string{"http://localhost:5173"}),
		LogLevel:            getEnvWithDefault("LOG_LEVEL", "info"),
	}
	
	// Encryption key is required
	encryptionKey := os.Getenv("TASK_ENCRYPTION_KEY")
	if encryptionKey == "" {
		return nil, errors.New("TASK_ENCRYPTION_KEY environment variable is required")
	}
	
	if len(encryptionKey) < 32 {
		return nil, errors.New("TASK_ENCRYPTION_KEY must be at least 32 characters long")
	}
	
	cfg.EncryptionKey = encryptionKey
	
	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	
	return cfg, nil
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	// Validate port
	if c.Port == "" {
		return errors.New("port cannot be empty")
	}
	
	// Validate GIN mode
	validModes := []string{"debug", "release", "test"}
	if !contains(validModes, c.GinMode) {
		return errors.New("invalid GIN_MODE, must be one of: debug, release, test")
	}
	
	// Validate data directory
	if c.DataDir == "" {
		return errors.New("data directory cannot be empty")
	}
	
	// Validate backup retention days
	if c.BackupRetentionDays < 1 {
		return errors.New("backup retention days must be at least 1")
	}
	
	// Validate log level
	validLevels := []string{"debug", "info", "warn", "error"}
	if !contains(validLevels, c.LogLevel) {
		return errors.New("invalid LOG_LEVEL, must be one of: debug, info, warn, error")
	}
	
	return nil
}

// LogConfiguration logs the current configuration (excluding sensitive data)
func (c *Config) LogConfiguration() {
	log.Printf("Server Configuration:")
	log.Printf("  Port: %s", c.Port)
	log.Printf("  GIN Mode: %s", c.GinMode)
	log.Printf("  Data Directory: %s", c.DataDir)
	log.Printf("  Backup Retention Days: %d", c.BackupRetentionDays)
	log.Printf("  CORS Allowed Origins: %v", c.CORSAllowedOrigins)
	log.Printf("  Log Level: %s", c.LogLevel)
	log.Printf("  Encryption Key: [CONFIGURED]")
}

// getEnvWithDefault returns environment variable value or default if not set
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvIntWithDefault returns environment variable as integer or default if not set
func getEnvIntWithDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
		log.Printf("Warning: Invalid integer value for %s: %s, using default: %d", key, value, defaultValue)
	}
	return defaultValue
}

// getEnvSliceWithDefault returns environment variable as slice or default if not set
func getEnvSliceWithDefault(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Split by comma and trim spaces
		parts := strings.Split(value, ",")
		result := make([]string, 0, len(parts))
		for _, part := range parts {
			if trimmed := strings.TrimSpace(part); trimmed != "" {
				result = append(result, trimmed)
			}
		}
		if len(result) > 0 {
			return result
		}
	}
	return defaultValue
}

// contains checks if a slice contains a string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.GinMode == "debug"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.GinMode == "release"
}

// GetServerAddress returns the full server address
func (c *Config) GetServerAddress() string {
	return ":" + c.Port
}