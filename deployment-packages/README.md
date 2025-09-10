# Task Management Application - Cross-Platform Deployment

Multi-platform deployment packages for the Task Management Application with Eisenhower Matrix.

## 📦 Available Packages

- **darwin-amd64**: `task-manage-1.0.0-darwin-amd64.tar.gz` (3.5M)
- **darwin-arm64**: `task-manage-1.0.0-darwin-arm64.tar.gz` (3.3M)
- **linux-amd64**: `task-manage-1.0.0-linux-amd64.tar.gz` (3.5M)
- **linux-arm64**: `task-manage-1.0.0-linux-arm64.tar.gz` (3.2M)

## 🔧 Platform-Specific Instructions

### Windows (windows-amd64, windows-arm64)
- Extract the ZIP file
- Edit `.env.production` to set encryption key
- Run `start.bat` to launch the application
- Access at http://localhost:8090

### macOS (darwin-amd64, darwin-arm64)  
- Extract the TAR.GZ file
- Make scripts executable: `chmod +x *.sh`
- Edit `.env.production` to set encryption key
- Run `./start.sh` to launch the application
- Access at http://localhost:8090

### Linux (linux-amd64, linux-arm64)
- Extract the TAR.GZ file  
- Make scripts executable: `chmod +x *.sh`
- Edit `.env.production` to set encryption key
- Run `./start.sh` to launch the application
- Access at http://localhost:8090

## ⚙️ System Requirements

### Minimum Requirements
- **RAM**: 512MB
- **Storage**: 100MB free space
- **Ports**: 8090 and 8081 available

### Platform-Specific Requirements

**Windows**:
- Windows 10 or later
- Python 3.x or Node.js (for frontend serving)

**macOS**:
- macOS 10.15+ (Catalina or later)
- Python 3.x (usually pre-installed) or Node.js

**Linux**:
- Linux kernel 3.2+
- Python 3.x or Node.js

## 🔐 Security Configuration

**IMPORTANT**: Before first run, edit `.env.production` in each package:

```env
TASK_ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
```

This key encrypts all task data using AES-256-GCM encryption.

## 📱 Application Features

- **Task Management**: Full CRUD operations for tasks
- **Eisenhower Matrix**: Visual priority quadrants (Do, Schedule, Delegate, Delete)
- **Drag & Drop**: Intuitive task categorization
- **Responsive Design**: Works on desktop and mobile devices
- **Encrypted Storage**: Secure local file storage
- **Real-time Updates**: Automatic synchronization

## 🔧 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in `.env.production` and startup scripts
2. **Permission denied**: Make sure scripts are executable (`chmod +x` on Unix)
3. **Missing HTTP server**: Install Python 3.x or Node.js for frontend serving
4. **Encryption key error**: Ensure key is at least 32 characters long

### Health Checks
- Frontend: http://localhost:8090
- Backend API: http://localhost:8081/api/health
- Task API: http://localhost:8081/api/tasks

## 📞 Support

Each platform package includes:
- Detailed README with platform-specific instructions
- Startup and stop scripts
- Environment configuration template
- Logging configuration

Check the `logs/` directory in each package for troubleshooting information.

---

## Build Information

- **Version**: 1.0.0
- **Build Time**: Wed Sep 10 11:59:41 UTC 2025
- **Git Commit**: 6fed402
- **Platforms**: 4 packages created
- **Total Size**:  82M

Built with ❤️ for cross-platform deployment.
