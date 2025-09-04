package middleware

import (
	"fmt"
	
	"github.com/gin-gonic/gin"
)

// RequestLogger creates a middleware for logging HTTP requests
func RequestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[%s] %s %s %d %s %s\n",
			param.TimeStamp.Format("2006-01-02 15:04:05"),
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
			param.ClientIP,
		)
	})
}

// ErrorLogger creates a middleware for logging errors
func ErrorLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		
		// Log any errors that occurred during request processing
		for _, err := range c.Errors {
			fmt.Printf("[ERROR] %s %s - %s\n", 
				c.Request.Method, 
				c.Request.URL.Path, 
				err.Error())
		}
	}
}

// Recovery creates a middleware for recovering from panics
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			c.JSON(500, gin.H{
				"success": false,
				"error":   "Internal server error: " + err,
			})
		} else {
			c.JSON(500, gin.H{
				"success": false,
				"error":   "Internal server error",
			})
		}
		c.Abort()
	})
}