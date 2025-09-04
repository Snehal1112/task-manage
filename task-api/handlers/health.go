package handlers

import (
	"net/http"
	"time"
	
	"github.com/gin-gonic/gin"
	"task-api/utils"
)

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// HealthCheck handles GET /api/health
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"service":   "task-api",
		"version":   "1.0.0",
	}
	
	utils.SuccessResponse(c, http.StatusOK, response)
}

// ReadinessCheck handles GET /api/ready
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	// In a real application, you might check:
	// - Database connectivity
	// - External service availability
	// - File system permissions
	
	response := map[string]interface{}{
		"status": "ready",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"checks": map[string]string{
			"storage": "ok",
			"encryption": "ok",
		},
	}
	
	utils.SuccessResponse(c, http.StatusOK, response)
}