package main

import (
	"log"
	"os"
	
	"github.com/gin-gonic/gin"
	"task-api/config"
	"task-api/handlers"
	"task-api/middleware"
	"task-api/services"
	"task-api/storage"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}
	
	// Set Gin mode
	gin.SetMode(cfg.GinMode)
	
	// Log configuration
	cfg.LogConfiguration()
	
	// Initialize encrypted storage
	encryptedStorage := storage.NewEncryptedStorage(cfg.DataDir, cfg.EncryptionKey)
	encryptedStorage.SetRetentionDays(cfg.BackupRetentionDays)
	
	// Initialize storage system
	if err := encryptedStorage.Initialize(); err != nil {
		log.Fatalf("Failed to initialize encrypted storage: %v", err)
	}
	log.Println("Encrypted storage initialized successfully")
	
	// Initialize services
	taskService := services.NewTaskService(encryptedStorage)
	
	// Initialize handlers
	taskHandler := handlers.NewTaskHandler(taskService)
	healthHandler := handlers.NewHealthHandler()
	
	// Create Gin router
	router := gin.New()
	
	// Setup middleware
	router.Use(middleware.Recovery())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.ErrorLogger())
	
	// Setup CORS
	if cfg.IsDevelopment() {
		router.Use(middleware.SetupDevelopmentCORS())
		log.Println("CORS configured for development (permissive)")
	} else {
		router.Use(middleware.SetupCORS(cfg.CORSAllowedOrigins))
		log.Printf("CORS configured for production, allowed origins: %v", cfg.CORSAllowedOrigins)
	}
	
	// API routes
	api := router.Group("/api")
	{
		// Health checks
		api.GET("/health", healthHandler.HealthCheck)
		api.GET("/ready", healthHandler.ReadinessCheck)
		api.GET("/info", taskHandler.GetStorageInfo)
		
		// Task operations
		tasks := api.Group("/tasks")
		{
			tasks.GET("", taskHandler.GetTasks)                    // GET /api/tasks
			tasks.POST("", taskHandler.CreateTask)                 // POST /api/tasks
			tasks.DELETE("", taskHandler.ClearAllTasks)            // DELETE /api/tasks?confirm=true
			tasks.GET("/demo", taskHandler.LoadDemoTasks)          // GET /api/tasks/demo
			tasks.GET("/overdue", taskHandler.GetOverdueTasks)     // GET /api/tasks/overdue
			tasks.GET("/:id", taskHandler.GetTask)                 // GET /api/tasks/:id
			tasks.PUT("/:id", taskHandler.UpdateTask)              // PUT /api/tasks/:id
			tasks.DELETE("/:id", taskHandler.DeleteTask)           // DELETE /api/tasks/:id
			tasks.PATCH("/:id/quadrant", taskHandler.MoveTaskToQuadrant)     // PATCH /api/tasks/:id/quadrant
			tasks.PATCH("/:id/completion", taskHandler.ToggleTaskCompletion) // PATCH /api/tasks/:id/completion
		}
		
		// Backup operations
		api.POST("/backup", taskHandler.CreateBackup)           // POST /api/backup
		api.GET("/backups", taskHandler.ListBackups)            // GET /api/backups
		api.POST("/restore", taskHandler.RestoreFromBackup)     // POST /api/restore
	}
	
	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Task Management API",
			"version": "1.0.0",
			"endpoints": gin.H{
				"health":     "/api/health",
				"tasks":      "/api/tasks",
				"backups":    "/api/backups",
				"docs":       "https://github.com/your-repo/task-api",
			},
		})
	})
	
	// Start server
	serverAddr := cfg.GetServerAddress()
	log.Printf("Starting server on %s", serverAddr)
	log.Printf("Environment: %s", cfg.GinMode)
	log.Printf("Data directory: %s", cfg.DataDir)
	
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func init() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	
	// Check if we're running with required environment variable
	if os.Getenv("TASK_ENCRYPTION_KEY") == "" {
		log.Println("Warning: TASK_ENCRYPTION_KEY not set. Please set this environment variable before starting the server.")
		log.Println("Example: export TASK_ENCRYPTION_KEY=\"your-secure-32-character-key-here\"")
	}
}