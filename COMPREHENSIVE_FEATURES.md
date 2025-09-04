# Eisenhower Matrix Task Manager - Go REST API Specification

## 📋 Table of Contents
- [Overview](#-overview)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [File Storage](#-file-storage)
- [Encryption](#-encryption)
- [Error Handling](#-error-handling)
- [Implementation Guide](#-implementation-guide)

---

## 🎯 Overview

This specification defines a **Go REST API** for the Eisenhower Matrix Task Manager with **encrypted file-based storage**. The API provides backend services to store, manage, and synchronize task data using encrypted JSON files instead of a traditional database. No authentication, Redis, or Docker required.

**Technology Stack:**
- **Go 1.22+** with Gin web framework
- **Encrypted JSON file storage** (no database)
- **AES-256 encryption** for data security
- **CORS support** for web client integration
- **Structured logging** with slog

---

## 📊 Data Models

### Core Task Model

```go
type Task struct {
    ID          string    `json:"id"`
    Title       string    `json:"title" validate:"required,min=1,max=200"`
    Description *string   `json:"description,omitempty"`
    DueDate     *time.Time `json:"due_date,omitempty"`
    Priority    Priority  `json:"priority" validate:"oneof=low medium high"`
    Status      TaskStatus `json:"status" validate:"oneof=pending in_progress completed cancelled"`
    Urgent      bool      `json:"urgent"`
    Important   bool      `json:"important"`
    Quadrant    Quadrant  `json:"quadrant" validate:"oneof=do schedule delegate delete unassigned"`
    Tags        []string  `json:"tags,omitempty"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type Priority string
const (
    PriorityLow    Priority = "low"
    PriorityMedium Priority = "medium"
    PriorityHigh   Priority = "high"
)

type TaskStatus string
const (
    StatusPending    TaskStatus = "pending"
    StatusInProgress TaskStatus = "in_progress"
    StatusCompleted  TaskStatus = "completed"
    StatusCancelled  TaskStatus = "cancelled"
)

type Quadrant string
const (
    QuadrantDo       Quadrant = "do"
    QuadrantSchedule Quadrant = "schedule"
    QuadrantDelegate Quadrant = "delegate"
    QuadrantDelete   Quadrant = "delete"
    QuadrantUnassigned Quadrant = "unassigned"
)
```

### Request/Response DTOs

```go
// Create Task Request
type CreateTaskRequest struct {
    Title       string     `json:"title" validate:"required,min=1,max=200"`
    Description *string    `json:"description,omitempty"`
    DueDate     *time.Time `json:"due_date,omitempty"`
    Priority    Priority   `json:"priority,omitempty"`
    Urgent      *bool      `json:"urgent,omitempty"`
    Important   *bool      `json:"important,omitempty"`
    Quadrant    Quadrant   `json:"quadrant,omitempty"`
    Tags        []string   `json:"tags,omitempty"`
}

// Update Task Request
type UpdateTaskRequest struct {
    Title       *string    `json:"title,omitempty" validate:"omitempty,min=1,max=200"`
    Description *string    `json:"description,omitempty"`
    DueDate     *time.Time `json:"due_date,omitempty"`
    Priority    *Priority  `json:"priority,omitempty" validate:"omitempty,oneof=low medium high"`
    Status      *TaskStatus `json:"status,omitempty" validate:"omitempty,oneof=pending in_progress completed cancelled"`
    Urgent      *bool      `json:"urgent,omitempty"`
    Important   *bool      `json:"important,omitempty"`
    Quadrant    *Quadrant  `json:"quadrant,omitempty" validate:"omitempty,oneof=do schedule delegate delete unassigned"`
    Tags        *[]string  `json:"tags,omitempty"`
}

// Task Response
type TaskResponse struct {
    Task
    IsOverdue bool `json:"is_overdue"`
}

// Tasks Response
type TasksResponse struct {
    Tasks []TaskResponse `json:"tasks"`
    Total int            `json:"total"`
}

// Quadrant Stats Response
type QuadrantStatsResponse struct {
    Quadrant string `json:"quadrant"`
    Count    int    `json:"count"`
    Urgent   int    `json:"urgent"`
    Overdue  int    `json:"overdue"`
}
```

---

## 🔗 API Endpoints

### Task Management Endpoints

```go
// GET /api/v1/tasks
func GetTasks(c *gin.Context) // Get all tasks with optional filters

// GET /api/v1/tasks/:id
func GetTask(c *gin.Context) // Get single task by ID

// POST /api/v1/tasks
func CreateTask(c *gin.Context) // Create new task

// PUT /api/v1/tasks/:id
func UpdateTask(c *gin.Context) // Update existing task

// DELETE /api/v1/tasks/:id
func DeleteTask(c *gin.Context) // Delete task

// PATCH /api/v1/tasks/:id/status
func UpdateTaskStatus(c *gin.Context) // Update task status

// PATCH /api/v1/tasks/:id/quadrant
func MoveTaskToQuadrant(c *gin.Context) // Move task to quadrant

// GET /api/v1/tasks/quadrants/stats
func GetQuadrantStats(c *gin.Context) // Get task statistics by quadrant

// GET /api/v1/tasks/overdue
func GetOverdueTasks(c *gin.Context) // Get overdue tasks

// POST /api/v1/tasks/bulk
func BulkCreateTasks(c *gin.Context) // Bulk create tasks

// DELETE /api/v1/tasks/bulk
func BulkDeleteTasks(c *gin.Context) // Bulk delete tasks
```

### Eisenhower Matrix Endpoints

```go
// GET /api/v1/matrix
func GetMatrixView(c *gin.Context) // Get complete matrix view

// GET /api/v1/matrix/quadrants/:quadrant
func GetQuadrantTasks(c *gin.Context) // Get tasks for specific quadrant

// POST /api/v1/matrix/move
func MoveTaskInMatrix(c *gin.Context) // Move task between quadrants

// GET /api/v1/matrix/analytics
func GetMatrixAnalytics(c *gin.Context) // Get matrix analytics and insights
```

### Utility Endpoints

```go
// GET /api/v1/health
func HealthCheck(c *gin.Context) // Health check endpoint

// POST /api/v1/backup
func CreateBackup(c *gin.Context) // Create encrypted backup of all tasks

// POST /api/v1/restore
func RestoreFromBackup(c *gin.Context) // Restore tasks from encrypted backup
```

---

## 📁 File Storage

### Storage Structure

```
data/
├── tasks.enc      # Encrypted tasks data
├── backup/        # Backup directory
│   ├── tasks_2025-09-05.enc
│   └── tasks_2025-09-04.enc
└── temp/          # Temporary files
```

### File Storage Service

```go
type FileStorage struct {
    dataDir     string
    encryptionKey []byte
}

func NewFileStorage(dataDir string, encryptionKey string) *FileStorage {
    key := sha256.Sum256([]byte(encryptionKey))
    return &FileStorage{
        dataDir:     dataDir,
        encryptionKey: key[:],
    }
}

func (fs *FileStorage) SaveTasks(tasks []Task) error {
    // Serialize tasks to JSON
    data, err := json.MarshalIndent(tasks, "", "  ")
    if err != nil {
        return fmt.Errorf("failed to marshal tasks: %w", err)
    }
    
    // Encrypt data
    encrypted, err := fs.encrypt(data)
    if err != nil {
        return fmt.Errorf("failed to encrypt data: %w", err)
    }
    
    // Write to file
    filePath := filepath.Join(fs.dataDir, "tasks.enc")
    return os.WriteFile(filePath, encrypted, 0600)
}

func (fs *FileStorage) LoadTasks() ([]Task, error) {
    filePath := filepath.Join(fs.dataDir, "tasks.enc")
    
    // Check if file exists
    if _, err := os.Stat(filePath); os.IsNotExist(err) {
        return []Task{}, nil // Return empty slice if file doesn't exist
    }
    
    // Read encrypted data
    encrypted, err := os.ReadFile(filePath)
    if err != nil {
        return nil, fmt.Errorf("failed to read tasks file: %w", err)
    }
    
    // Decrypt data
    decrypted, err := fs.decrypt(encrypted)
    if err != nil {
        return nil, fmt.Errorf("failed to decrypt data: %w", err)
    }
    
    // Unmarshal JSON
    var tasks []Task
    if err := json.Unmarshal(decrypted, &tasks); err != nil {
        return nil, fmt.Errorf("failed to unmarshal tasks: %w", err)
    }
    
    return tasks, nil
}
```

---

## 🔐 Encryption

### AES-256 Encryption Implementation

```go
func (fs *FileStorage) encrypt(plaintext []byte) ([]byte, error) {
    block, err := aes.NewCipher(fs.encryptionKey)
    if err != nil {
        return nil, err
    }
    
    // Generate random nonce
    nonce := make([]byte, 12)
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return nil, err
    }
    
    aesgcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    
    // Encrypt and append nonce
    ciphertext := aesgcm.Seal(nil, nonce, plaintext, nil)
    return append(nonce, ciphertext...), nil
}

func (fs *FileStorage) decrypt(ciphertext []byte) ([]byte, error) {
    if len(ciphertext) < 12 {
        return nil, errors.New("ciphertext too short")
    }
    
    block, err := aes.NewCipher(fs.encryptionKey)
    if err != nil {
        return nil, err
    }
    
    aesgcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    
    nonce := ciphertext[:12]
    encrypted := ciphertext[12:]
    
    return aesgcm.Open(nil, nonce, encrypted, nil)
}
```

### Encryption Key Management

```go
func generateEncryptionKey() (string, error) {
    key := make([]byte, 32) // 256 bits
    if _, err := rand.Read(key); err != nil {
        return "", err
    }
    return base64.StdEncoding.EncodeToString(key), nil
}

func loadEncryptionKey(keyFile string) ([]byte, error) {
    if _, err := os.Stat(keyFile); os.IsNotExist(err) {
        // Generate new key if file doesn't exist
        keyStr, err := generateEncryptionKey()
        if err != nil {
            return nil, err
        }
        
        if err := os.WriteFile(keyFile, []byte(keyStr), 0600); err != nil {
            return nil, err
        }
        
        return base64.StdEncoding.DecodeString(keyStr)
    }
    
    // Load existing key
    keyData, err := os.ReadFile(keyFile)
    if err != nil {
        return nil, err
    }
    
    return base64.StdEncoding.DecodeString(string(keyData))
}
```

---

## ⚠️ Error Handling

### Error Response Structure

```go
type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
    Code    string `json:"code"`
    Timestamp time.Time `json:"timestamp"`
}

type ValidationError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
    Value   string `json:"value,omitempty"`
}

type ValidationErrorResponse struct {
    Error       string            `json:"error"`
    Message     string            `json:"message"`
    Code        string            `json:"code"`
    ValidationErrors []ValidationError `json:"validation_errors"`
    Timestamp   time.Time         `json:"timestamp"`
}
```

### Error Codes

```go
const (
    ErrCodeValidation      = "VALIDATION_ERROR"
    ErrCodeNotFound        = "NOT_FOUND"
    ErrCodeConflict        = "CONFLICT"
    ErrCodeInternal        = "INTERNAL_ERROR"
    ErrCodeBadRequest      = "BAD_REQUEST"
    ErrCodeEncryption      = "ENCRYPTION_ERROR"
    ErrCodeFileSystem      = "FILESYSTEM_ERROR"
)
```

### Global Error Handler

```go
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            
            // Handle different error types
            var validationErr validator.ValidationErrors
            if errors.As(err.Err, &validationErr) {
                handleValidationError(c, validationErr)
                return
            }
            
            // Handle file system errors
            if isFileSystemError(err.Err) {
                c.JSON(http.StatusInternalServerError, ErrorResponse{
                    Error:     "File System Error",
                    Message:   "Failed to access data storage",
                    Code:      ErrCodeFileSystem,
                    Timestamp: time.Now(),
                })
                return
            }
            
            // Default error response
            c.JSON(http.StatusInternalServerError, ErrorResponse{
                Error:     "Internal Server Error",
                Message:   err.Error(),
                Code:      ErrCodeInternal,
                Timestamp: time.Now(),
            })
        }
    }
}
```

---

## 🚀 Implementation Guide

### Project Structure

```
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   ├── tasks.go
│   │   ├── matrix.go
│   │   └── health.go
│   ├── models/
│   │   ├── task.go
│   │   └── dto.go
│   ├── services/
│   │   ├── task_service.go
│   │   ├── file_storage.go
│   │   └── encryption.go
│   ├── utils/
│   │   ├── validation.go
│   │   └── logger.go
│   └── config/
│       └── config.go
├── data/
│   ├── tasks.enc
│   └── key.enc
├── go.mod
├── go.sum
└── README.md
```

### Key Dependencies

```go
module github.com/your-org/eisenhower-api

go 1.22

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/go-playground/validator/v10 v10.19.0
    github.com/google/uuid v1.6.0
    github.com/spf13/viper v1.18.2
    github.com/rotisserie/eris v1.6.0
)
```

### Main Application Setup

```go
func main() {
    // Load configuration
    cfg := config.Load()
    
    // Initialize logger
    logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
        Level: cfg.LogLevel,
    }))
    
    // Initialize encryption key
    encryptionKey, err := loadEncryptionKey("data/key.enc")
    if err != nil {
        logger.Error("Failed to load encryption key", "error", err)
        os.Exit(1)
    }
    
    // Initialize file storage
    storage := services.NewFileStorage("data", encryptionKey)
    
    // Initialize task service
    taskService := services.NewTaskService(storage)
    
    // Initialize handlers
    taskHandler := handlers.NewTaskHandler(taskService, logger)
    matrixHandler := handlers.NewMatrixHandler(taskService, logger)
    healthHandler := handlers.NewHealthHandler(logger)
    
    // Setup router
    router := setupRouter(cfg, taskHandler, matrixHandler, healthHandler)
    
    // Start server
    logger.Info("Starting server", "port", cfg.Server.Port)
    if err := router.Run(":" + cfg.Server.Port); err != nil {
        logger.Error("Failed to start server", "error", err)
        os.Exit(1)
    }
}
```

### Configuration

```go
type Config struct {
    Server struct {
        Port string `mapstructure:"port"`
        Host string `mapstructure:"host"`
    } `mapstructure:"server"`
    
    LogLevel slog.Level `mapstructure:"log_level"`
    
    CORS struct {
        AllowedOrigins []string `mapstructure:"allowed_origins"`
    } `mapstructure:"cors"`
}

func Load() *Config {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath(".")
    
    viper.SetDefault("server.port", "8080")
    viper.SetDefault("server.host", "localhost")
    viper.SetDefault("log_level", slog.LevelInfo)
    viper.SetDefault("cors.allowed_origins", []string{"http://localhost:3000"})
    
    if err := viper.ReadInConfig(); err != nil {
        // Use defaults if config file not found
    }
    
    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        panic(fmt.Errorf("unable to decode config: %w", err))
    }
    
    return &cfg
}
```

### Router Setup

```go
func setupRouter(cfg *config.Config, taskHandler *handlers.TaskHandler, matrixHandler *handlers.MatrixHandler, healthHandler *handlers.HealthHandler) *gin.Engine {
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }
    
    router := gin.New()
    
    // Middleware
    router.Use(gin.Logger())
    router.Use(gin.Recovery())
    router.Use(cors.New(cors.Config{
        AllowOrigins:     cfg.CORS.AllowedOrigins,
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
        AllowCredentials: true,
    }))
    router.Use(ErrorHandler())
    
    // API routes
    v1 := router.Group("/api/v1")
    {
        // Health check
        v1.GET("/health", healthHandler.HealthCheck)
        
        // Task routes
        tasks := v1.Group("/tasks")
        {
            tasks.GET("", taskHandler.GetTasks)
            tasks.POST("", taskHandler.CreateTask)
            tasks.GET("/:id", taskHandler.GetTask)
            tasks.PUT("/:id", taskHandler.UpdateTask)
            tasks.DELETE("/:id", taskHandler.DeleteTask)
            tasks.PATCH("/:id/status", taskHandler.UpdateTaskStatus)
            tasks.PATCH("/:id/quadrant", taskHandler.MoveTaskToQuadrant)
            tasks.GET("/quadrants/stats", taskHandler.GetQuadrantStats)
            tasks.GET("/overdue", taskHandler.GetOverdueTasks)
            tasks.POST("/bulk", taskHandler.BulkCreateTasks)
            tasks.DELETE("/bulk", taskHandler.BulkDeleteTasks)
        }
        
        // Matrix routes
        matrix := v1.Group("/matrix")
        {
            matrix.GET("", matrixHandler.GetMatrixView)
            matrix.GET("/quadrants/:quadrant", matrixHandler.GetQuadrantTasks)
            matrix.POST("/move", matrixHandler.MoveTaskInMatrix)
            matrix.GET("/analytics", matrixHandler.GetMatrixAnalytics)
        }
        
        // Utility routes
        v1.POST("/backup", taskHandler.CreateBackup)
        v1.POST("/restore", taskHandler.RestoreFromBackup)
    }
    
    return router
}
```

---

## 📈 API Features Summary

| Feature Category | Endpoints | Status |
|------------------|-----------|--------|
| Task Management | 10 endpoints | ✅ Ready for Implementation |
| Eisenhower Matrix | 4 endpoints | ✅ Ready for Implementation |
| File Storage | AES-256 Encrypted | ✅ Ready for Implementation |
| Utility Functions | 3 endpoints | ✅ Ready for Implementation |
| Error Handling | Structured Responses | ✅ Ready for Implementation |
| CORS Support | Configurable | ✅ Ready for Implementation |

---

## 🎯 Next Steps

1. **Initialize Go Module**: `go mod init github.com/your-org/eisenhower-api`
2. **Implement Core Models**: Define structs in `internal/models/`
3. **Create File Storage Service**: Implement encrypted file operations
4. **Implement Task Service**: Business logic for task management
5. **Create HTTP Handlers**: REST API endpoint implementations
6. **Add Configuration**: Environment-based configuration
7. **Implement Middleware**: CORS, logging, error handling
8. **Add Validation**: Input validation and sanitization
9. **Write Tests**: Unit and integration tests
10. **Add Documentation**: API documentation and examples

---

*API Specification Version: 1.0 | Last Updated: 2025-09-05 | Go Version: 1.22+*
