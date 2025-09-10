# Task Management API

A secure REST API built with Go that provides encrypted file-based storage for task management with automatic backups and full integration with the React frontend.

## Features

- **🔐 AES-256-GCM Encryption**: All tasks are encrypted at rest using authenticated encryption
- **🔑 PBKDF2 Key Derivation**: Secure key derivation with 100,000 iterations
- **💾 File-Based Storage**: No database required - encrypted JSON file storage
- **🔄 Automatic Backups**: Timestamped backups on every write operation
- **🛡️ CORS Support**: Configured for React frontend integration
- **✅ Input Validation**: Comprehensive validation matching frontend requirements
- **📝 RESTful API**: Standard HTTP methods with JSON responses
- **🔒 Concurrent Safety**: File locking prevents data corruption

## Quick Start

### Prerequisites

- Go 1.21 or later
- Git

### Installation

1. **Clone and build**:
```bash
cd task-api
go build -o task-api
```

2. **Set encryption key**:
```bash
export TASK_ENCRYPTION_KEY="your-secure-32-character-key-here"
```

3. **Start server**:
```bash
./task-api
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Health & Info
- `GET /api/health` - Health check
- `GET /api/ready` - Readiness check  
- `GET /api/info` - Storage information

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/quadrant` - Move task to quadrant
- `PATCH /api/tasks/:id/completion` - Toggle task completion

### Demo & Utility
- `GET /api/tasks/demo` - Load demo tasks
- `GET /api/tasks/overdue` - Get overdue tasks
- `DELETE /api/tasks?confirm=true` - Clear all tasks

### Backup Management
- `POST /api/backup` - Create manual backup
- `GET /api/backups` - List available backups
- `POST /api/restore` - Restore from backup

## Configuration

Set these environment variables:

```bash
# Required
TASK_ENCRYPTION_KEY="your-secure-32-character-key-here"

# Optional (defaults shown)
PORT=8080
GIN_MODE=debug
DATA_DIR=./data
BACKUP_RETENTION_DAYS=30
CORS_ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=info
```

## Task Data Structure

Tasks match the TypeScript interface exactly:

```json
{
  "id": "uuid-string",
  "title": "Task title (max 100 chars)",
  "description": "Optional description (max 2000 chars)",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "urgent": false,
  "important": true,
  "quadrant": "SCHEDULE",
  "completed": false,
  "completedAt": null,
  "createdAt": "2023-11-01T10:00:00.000Z",
  "updatedAt": "2023-11-01T10:00:00.000Z"
}
```

### Quadrants
- `UNASSIGNED` - New tasks (Task Panel)
- `DO` - Urgent + Important
- `SCHEDULE` - Not Urgent + Important  
- `DELEGATE` - Urgent + Not Important
- `DELETE` - Not Urgent + Not Important

## Security Features

- **Encryption**: AES-256-GCM with random IV per operation
- **Authentication**: Built-in authentication tags prevent tampering
- **Key Security**: PBKDF2 with salt and 100,000 iterations
- **File Permissions**: Encrypted files stored with 600 permissions
- **Input Validation**: All inputs validated and sanitized

## Storage Details

### File Structure
```
data/
├── tasks.enc              # Main encrypted task data
├── backups/              # Automatic backups
│   ├── tasks_backup_20231101_100000.enc
│   └── tasks_backup_20231101_110000.enc
└── .lock                 # File lock for concurrent access
```

### Backup System
- **Automatic**: Created before each write operation
- **Retention**: Configurable retention period (default 30 days)
- **Format**: Same encryption as main file
- **Naming**: `tasks_backup_YYYYMMDD_HHMMSS.enc`

## Development

### Running Tests
```bash
go test ./...
```

### Building for Production
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o task-api
```

### Docker Support
```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY task-api .
EXPOSE 8080
CMD ["./task-api"]
```

## Architecture

### Project Structure
```
task-api/
├── config/          # Configuration management
├── models/          # Task model and validation
├── storage/         # Encrypted file storage
├── handlers/        # HTTP request handlers
├── services/        # Business logic
├── middleware/      # CORS, logging, recovery
├── utils/          # Utilities and helpers
└── main.go         # Application entry point
```

### Core Components

1. **Encryption Service** (`storage/crypto.go`)
   - AES-256-GCM implementation
   - PBKDF2 key derivation
   - Secure random generation

2. **File Manager** (`storage/file_manager.go`)
   - File locking with timeout
   - Atomic write operations
   - Backup management

3. **Task Service** (`services/task_service.go`)
   - Business logic layer
   - CRUD operations
   - Data validation

4. **API Handlers** (`handlers/tasks.go`)
   - HTTP request processing
   - JSON serialization
   - Error handling

## Production Deployment

### Systemd Service
```ini
[Unit]
Description=Task Management API
After=network.target

[Service]
Type=simple
User=task-api
WorkingDirectory=/opt/task-api
Environment=TASK_ENCRYPTION_KEY=your-production-key
Environment=GIN_MODE=release
Environment=DATA_DIR=/var/lib/task-api
ExecStart=/opt/task-api/task-api
Restart=always

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration
```nginx
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Integration with React Frontend

The API is designed to integrate seamlessly with the existing React task management application:

1. **API Compatibility**: All endpoints match Redux action patterns
2. **CORS Support**: Configured for local development
3. **Error Format**: Consistent JSON error responses
4. **Data Validation**: Server-side validation matches frontend rules

Start both services for full integration:
```bash
# Terminal 1: Start API
cd task-api
export TASK_ENCRYPTION_KEY="your-key"
./task-api

# Terminal 2: Start React app
cd ..
yarn dev
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
```bash
lsof -ti:8080 | xargs kill -9
```

2. **Invalid encryption key**:
- Key must be at least 32 characters
- Use strong random characters
- Consider using base64 encoded keys

3. **CORS errors**:
- Check `CORS_ALLOWED_ORIGINS` environment variable
- Ensure React app URL is included

4. **File permission errors**:
```bash
chmod 755 data/
chmod 600 data/tasks.enc
```

### Logs
The application logs to stderr with timestamps. In production, redirect to files:
```bash
./task-api 2>> /var/log/task-api.log
```

## Security Considerations

1. **Encryption Key Management**:
   - Use strong, random keys (32+ characters)
   - Store securely (environment variables, key management systems)
   - Rotate periodically

2. **File System Security**:
   - Restrict data directory permissions
   - Regular backup verification
   - Monitor file integrity

3. **Network Security**:
   - Use HTTPS in production
   - Configure proper CORS origins
   - Implement rate limiting if needed

## License

This API is part of the Task Management application and follows the same licensing terms.