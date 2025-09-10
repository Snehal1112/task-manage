# Task Management Application - linux-arm64

Production deployment package for linux-arm64 systems.

## Package Information

- **Version**: 1.0.0
- **Build Time**: 20250910115912
- **Git Commit**: 6fed402
- **Platform**: linux-arm64
- **Binary**: task-api

## 📦 Package Contents

```
task-manage-linux-arm64/
├── backend/
│   └── task-api           # Backend API server
├── frontend/                         # React application (built)
├── config/
│   └── .env.production              # Environment configuration
├── logs/                            # Application logs (created on startup)
├── start.sh                      # Application startup script
├── stop.sh                       # Application shutdown script
└── README.md                        # This file
```


### Linux Installation

1. **Download and extract** the package
2. **Open terminal** and navigate to the extracted folder
3. **Make scripts executable**: `chmod +x *.sh`
4. **Edit configuration**: `nano .env.production` and set your encryption key
5. **Run the application**: `./start.sh`

### Linux Requirements

- Linux kernel 3.2+ (most modern distributions)
- Python 3.x or Node.js
- 512MB RAM minimum
- Ports 8090 and 8081 available

### Linux Package Managers

Install HTTP server if needed:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3

# CentOS/RHEL/Fedora
sudo yum install python3  # or dnf install python3

# Arch Linux
sudo pacman -S python
```


## 🚀 Quick Start

### Basic Usage

1. **Configure encryption key** (REQUIRED):
   Edit `.env.production` and set:
   ```
   TASK_ENCRYPTION_KEY=your-secure-32-character-key-here
   ```

2. **Start the application**:
   ```bash
   ./start.sh
   ```

3. **Stop the application**:
   ```bash
   ./stop.sh
   ```

4. **Access the application**:
   - Web Interface: http://localhost:8090
   - API Health: http://localhost:8081/api/health

## 🔧 Configuration

### Environment Variables (.env.production)

| Variable | Description | Default |
|----------|-------------|---------|
| `TASK_ENCRYPTION_KEY` | Encryption key (32+ chars) | **REQUIRED** |
| `PORT` | Backend API port | 8081 |
| `SERVER_HOST` | Backend bind address | localhost |
| `DATA_DIR` | Data storage directory | ./data |
| `LOG_LEVEL` | Logging level | info |

### Port Configuration

- **Frontend Server**: Port 8090
- **Backend API**: Port 8081

To change ports, edit the startup script and `.env.production` file.

## 🔐 Security & Data

- **Encryption**: AES-256-GCM for all task data
- **Storage**: Encrypted JSON files in `./data/` directory
- **Backups**: Automatic with configurable retention
- **Input Validation**: At all API layers

## 📱 Application Features

- **Task Management**: Create, edit, delete tasks
- **Eisenhower Matrix**: Drag tasks into priority quadrants
- **Responsive Design**: Works on desktop and mobile
- **Persistent Storage**: Encrypted local file storage
- **Real-time Updates**: Automatic task synchronization

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in configuration
2. **Permission denied**: Ensure scripts are executable
3. **API connection error**: Check both backend and frontend are running
4. **Encryption key error**: Ensure key is 32+ characters

### Health Checks

- Backend: http://localhost:8081/api/health
- Frontend: http://localhost:8090
- API Status: http://localhost:8081/api/tasks

### Log Files

Check `logs/` directory for:
- `backend.log` - Backend API logs
- `frontend.log` - Frontend server logs

## 📞 Support

For issues and questions:
- Check logs in `logs/` directory
- Verify configuration in `.env.production`
- Ensure all requirements are installed

---

**Build Information**
- Version: $VERSION
- Platform: $platform  
- Build Time: $BUILD_TIME
- Git Commit: $GIT_COMMIT
