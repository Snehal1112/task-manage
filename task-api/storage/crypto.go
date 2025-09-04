package storage

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"errors"
	"math/big"
	"golang.org/x/crypto/pbkdf2"
)

const (
	// Encryption constants
	SaltSize     = 16   // 128-bit salt
	IVSize       = 12   // 96-bit IV for GCM
	TagSize      = 16   // 128-bit authentication tag
	KeySize      = 32   // 256-bit key
	PBKDF2Iters  = 100000 // PBKDF2 iterations for key derivation
)

// CryptoService handles encryption and decryption operations
type CryptoService struct {
	password string
}

// NewCryptoService creates a new crypto service with the given password
func NewCryptoService(password string) *CryptoService {
	return &CryptoService{
		password: password,
	}
}

// deriveKey derives an encryption key from password and salt using PBKDF2
func (c *CryptoService) deriveKey(salt []byte) []byte {
	return pbkdf2.Key([]byte(c.password), salt, PBKDF2Iters, KeySize, sha256.New)
}

// generateSalt generates a random salt for key derivation
func (c *CryptoService) generateSalt() ([]byte, error) {
	salt := make([]byte, SaltSize)
	if _, err := rand.Read(salt); err != nil {
		return nil, errors.New("failed to generate salt")
	}
	return salt, nil
}

// generateIV generates a random IV for AES-GCM encryption
func (c *CryptoService) generateIV() ([]byte, error) {
	iv := make([]byte, IVSize)
	if _, err := rand.Read(iv); err != nil {
		return nil, errors.New("failed to generate IV")
	}
	return iv, nil
}

// Encrypt encrypts plaintext using AES-256-GCM with random salt and IV
// Returns: salt + iv + ciphertext + tag
func (c *CryptoService) Encrypt(plaintext []byte) ([]byte, error) {
	if len(plaintext) == 0 {
		return nil, errors.New("plaintext cannot be empty")
	}

	// Generate random salt and derive key
	salt, err := c.generateSalt()
	if err != nil {
		return nil, err
	}
	
	key := c.deriveKey(salt)
	
	// Create AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("failed to create AES cipher")
	}
	
	// Create GCM mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.New("failed to create GCM cipher")
	}
	
	// Generate random IV
	iv, err := c.generateIV()
	if err != nil {
		return nil, err
	}
	
	// Encrypt data
	ciphertext := gcm.Seal(nil, iv, plaintext, nil)
	
	// Combine: salt + iv + ciphertext (includes tag)
	result := make([]byte, 0, SaltSize+IVSize+len(ciphertext))
	result = append(result, salt...)
	result = append(result, iv...)
	result = append(result, ciphertext...)
	
	return result, nil
}

// Decrypt decrypts ciphertext using AES-256-GCM
// Expects: salt + iv + ciphertext + tag format
func (c *CryptoService) Decrypt(encrypted []byte) ([]byte, error) {
	if len(encrypted) < SaltSize+IVSize+TagSize {
		return nil, errors.New("encrypted data too short")
	}
	
	// Extract components
	salt := encrypted[:SaltSize]
	iv := encrypted[SaltSize : SaltSize+IVSize]
	ciphertext := encrypted[SaltSize+IVSize:]
	
	// Derive key from salt
	key := c.deriveKey(salt)
	
	// Create AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("failed to create AES cipher")
	}
	
	// Create GCM mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.New("failed to create GCM cipher")
	}
	
	// Decrypt and authenticate
	plaintext, err := gcm.Open(nil, iv, ciphertext, nil)
	if err != nil {
		return nil, errors.New("decryption failed: invalid data or wrong password")
	}
	
	return plaintext, nil
}

// ValidatePassword checks if the password can decrypt existing encrypted data
func (c *CryptoService) ValidatePassword(encryptedData []byte) error {
	if len(encryptedData) == 0 {
		return nil // No data to validate against
	}
	
	_, err := c.Decrypt(encryptedData)
	return err
}

// SecureWipe overwrites sensitive data in memory
func SecureWipe(data []byte) {
	if data != nil {
		for i := range data {
			data[i] = 0
		}
	}
}

// GenerateSecurePassword generates a random password for encryption
func GenerateSecurePassword(length int) (string, error) {
	if length < 32 {
		length = 32 // Minimum secure length
	}
	
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	password := make([]byte, length)
	
	for i := range password {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", errors.New("failed to generate random password")
		}
		password[i] = charset[n.Int64()]
	}
	
	return string(password), nil
}