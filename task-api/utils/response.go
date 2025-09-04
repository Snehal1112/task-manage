package utils

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// APIResponse represents a standard API response structure
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse represents a detailed error response
type ErrorResponse struct {
	Success bool                   `json:"success"`
	Error   string                 `json:"error"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// SuccessResponse sends a successful response with data
func SuccessResponse(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Data:    data,
	})
}

// SuccessResponseWithMessage sends a successful response with data and message
func SuccessResponseWithMessage(c *gin.Context, statusCode int, data interface{}, message string) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// ErrorResponse sends an error response
func ErrorResponseJSON(c *gin.Context, statusCode int, errorMsg string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   errorMsg,
	})
}

// ErrorResponseWithDetails sends an error response with additional details
func ErrorResponseWithDetails(c *gin.Context, statusCode int, errorMsg string, details map[string]interface{}) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Error:   errorMsg,
		Details: details,
	})
}

// ValidationErrorResponse sends a validation error response
func ValidationErrorResponse(c *gin.Context, err error) {
	details := map[string]interface{}{
		"validation_error": err.Error(),
	}
	
	ErrorResponseWithDetails(c, http.StatusBadRequest, "Validation failed", details)
}

// NotFoundResponse sends a 404 not found response
func NotFoundResponse(c *gin.Context, resource string) {
	ErrorResponseJSON(c, http.StatusNotFound, resource+" not found")
}

// InternalErrorResponse sends a 500 internal server error response
func InternalErrorResponse(c *gin.Context, err error) {
	// Log the actual error for debugging
	// In production, you might want to use a proper logging system
	if gin.Mode() == gin.DebugMode {
		details := map[string]interface{}{
			"internal_error": err.Error(),
		}
		ErrorResponseWithDetails(c, http.StatusInternalServerError, "Internal server error", details)
	} else {
		ErrorResponseJSON(c, http.StatusInternalServerError, "Internal server error")
	}
}

// BadRequestResponse sends a 400 bad request response
func BadRequestResponse(c *gin.Context, errorMsg string) {
	ErrorResponseJSON(c, http.StatusBadRequest, errorMsg)
}

// UnauthorizedResponse sends a 401 unauthorized response
func UnauthorizedResponse(c *gin.Context) {
	ErrorResponseJSON(c, http.StatusUnauthorized, "Unauthorized")
}

// ForbiddenResponse sends a 403 forbidden response
func ForbiddenResponse(c *gin.Context) {
	ErrorResponseJSON(c, http.StatusForbidden, "Forbidden")
}

// ConflictResponse sends a 409 conflict response
func ConflictResponse(c *gin.Context, errorMsg string) {
	ErrorResponseJSON(c, http.StatusConflict, errorMsg)
}