package utils

import (
	"errors"
	"strings"
	"time"
)

// ValidateID validates that an ID is not empty after trimming
func ValidateID(id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("ID cannot be empty")
	}
	return nil
}

// ValidateTitle validates task title according to business rules
func ValidateTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return errors.New("title cannot be empty")
	}
	if len(title) > 100 {
		return errors.New("title must be 100 characters or less")
	}
	return nil
}

// ValidateDescription validates task description according to business rules
func ValidateDescription(description *string) error {
	if description == nil {
		return nil // Optional field
	}
	
	if len(*description) > 500 {
		return errors.New("description must be 500 characters or less")
	}
	return nil
}

// ValidateDueDate validates due date format
func ValidateDueDate(dueDate *string) error {
	if dueDate == nil || *dueDate == "" {
		return nil // Optional field
	}
	
	_, err := time.Parse(time.RFC3339, *dueDate)
	if err != nil {
		return errors.New("due date must be in ISO8601 format (RFC3339)")
	}
	
	return nil
}

// ValidateQuadrant validates that quadrant is one of the allowed values
func ValidateQuadrant(quadrant string) error {
	validQuadrants := []string{"DO", "SCHEDULE", "DELEGATE", "DELETE", "UNASSIGNED"}
	
	for _, valid := range validQuadrants {
		if quadrant == valid {
			return nil
		}
	}
	
	return errors.New("invalid quadrant, must be one of: DO, SCHEDULE, DELEGATE, DELETE, UNASSIGNED")
}

// TrimAndValidateString trims a string and validates it's not empty
func TrimAndValidateString(value, fieldName string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "", errors.New(fieldName + " cannot be empty")
	}
	return trimmed, nil
}

// TrimString safely trims a string pointer, returning nil for empty strings
func TrimString(value *string) *string {
	if value == nil {
		return nil
	}
	
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	
	return &trimmed
}

// IsValidISO8601 checks if a string is a valid ISO8601 datetime
func IsValidISO8601(dateStr string) bool {
	if dateStr == "" {
		return true // Empty is considered valid for optional fields
	}
	
	_, err := time.Parse(time.RFC3339, dateStr)
	return err == nil
}

// SanitizeTitle sanitizes and validates a task title
func SanitizeTitle(title string) (string, error) {
	sanitized := strings.TrimSpace(title)
	
	if sanitized == "" {
		return "", errors.New("title is required")
	}
	
	if len(sanitized) > 100 {
		return "", errors.New("title must be 100 characters or less")
	}
	
	return sanitized, nil
}

// SanitizeDescription sanitizes a task description
func SanitizeDescription(description *string) (*string, error) {
	if description == nil {
		return nil, nil
	}
	
	sanitized := strings.TrimSpace(*description)
	
	if sanitized == "" {
		return nil, nil // Empty description becomes nil
	}
	
	if len(sanitized) > 500 {
		return nil, errors.New("description must be 500 characters or less")
	}
	
	return &sanitized, nil
}

// ValidateRequiredFields validates that all required fields are present
func ValidateRequiredFields(fields map[string]interface{}) error {
	var missingFields []string
	
	for fieldName, value := range fields {
		if value == nil {
			missingFields = append(missingFields, fieldName)
			continue
		}
		
		// Check for empty strings
		if str, ok := value.(string); ok && strings.TrimSpace(str) == "" {
			missingFields = append(missingFields, fieldName)
		}
	}
	
	if len(missingFields) > 0 {
		return errors.New("missing required fields: " + strings.Join(missingFields, ", "))
	}
	
	return nil
}