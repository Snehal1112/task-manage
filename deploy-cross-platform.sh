#!/bin/bash

# Task Management Application - Cross-Platform Deployment Script
# Builds deployment packages for Mac, Linux, and Windows systems

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$PROJECT_ROOT/deployment-packages"
FRONTEND_DIR="$BUILD_DIR/frontend"
BACKEND_DIR="$BUILD_DIR/backend"
DOCS_DIR="$BUILD_DIR/docs"

# Version information
VERSION="1.0.0"
BUILD_TIME=$(date -u +"%Y%m%d%H%M%S")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Platform configurations (compatible with bash 3.2+)
PLATFORMS="linux-amd64 linux-arm64 darwin-amd64 darwin-arm64 windows-amd64 windows-arm64"

# Helper functions for platform-specific configurations
get_platform_os() {
    case "$1" in
        linux-*) echo "linux" ;;
        darwin-*) echo "darwin" ;;
        windows-*) echo "windows" ;;
    esac
}

get_platform_arch() {
    case "$1" in
        *-amd64) echo "amd64" ;;
        *-arm64) echo "arm64" ;;
    esac
}

get_binary_ext() {
    case "$1" in
        windows-*) echo ".exe" ;;
        *) echo "" ;;
    esac
}

get_archive_ext() {
    case "$1" in
        windows-*) echo ".zip" ;;
        *) echo ".tar.gz" ;;
    esac
}

get_script_ext() {
    case "$1" in
        windows-*) echo ".bat" ;;
        *) echo ".sh" ;;
    esac
}


# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_platform() {
    echo -e "${CYAN}[PLATFORM]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect current platform
detect_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    
    case "$arch" in
        x86_64|amd64) arch="amd64" ;;
        arm64|aarch64) arch="arm64" ;;
        *) print_error "Unsupported architecture: $arch"; exit 1 ;;
    esac
    
    case "$os" in
        linux) echo "linux-$arch" ;;
        darwin) echo "darwin-$arch" ;;
        cygwin*|mingw*|msys*) echo "windows-$arch" ;;
        *) print_error "Unsupported OS: $os"; exit 1 ;;
    esac
}

# Function to verify prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists yarn; then
        missing_deps+=("Yarn")
    fi
    
    if ! command_exists go; then
        missing_deps+=("Go")
    fi
    
    # Check for platform-specific tools
    local current_platform=$(detect_platform)
    if [[ "$current_platform" == *"windows"* ]] || [[ "$1" == *"windows"* ]]; then
        if ! command_exists zip; then
            missing_deps+=("zip")
        fi
    fi
    
    if ! command_exists tar; then
        missing_deps+=("tar")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
    
    # Display Go version and available platforms
    print_status "Go version: $(go version)"
    print_status "Available target platforms:"
    for platform in $PLATFORMS; do
        local os=$(get_platform_os "$platform")
        local arch=$(get_platform_arch "$platform")
        print_status "  - $platform ($os/$arch)"
    done
}

# Function to clean previous builds
clean_builds() {
    print_header "Cleaning Previous Builds"
    
    # Remove previous deployment packages
    if [ -d "$BUILD_DIR" ]; then
        print_status "Removing previous deployment packages..."
        rm -rf "$BUILD_DIR"
    fi
    
    # Clean frontend build artifacts
    if [ -d "$PROJECT_ROOT/dist" ]; then
        print_status "Cleaning frontend build artifacts..."
        rm -rf "$PROJECT_ROOT/dist"
    fi
    
    # Clean Go build artifacts
    if [ -d "$PROJECT_ROOT/task-api" ]; then
        cd "$PROJECT_ROOT/task-api"
        if [ -f "task-api" ] || [ -f "task-api.exe" ]; then
            print_status "Cleaning Go build artifacts..."
            rm -f task-api task-api.exe
        fi
        cd "$PROJECT_ROOT"
    fi
    
    print_success "Build artifacts cleaned"
}

# Function to build frontend
build_frontend() {
    print_header "Building Frontend Application"
    
    print_status "Installing frontend dependencies..."
    cd "$PROJECT_ROOT"
    yarn install --frozen-lockfile
    
    print_status "Type checking TypeScript..."
    yarn type-check
    
    print_status "Building React application for production..."
    yarn build
    
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        print_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Frontend build completed successfully"
}

# Function to build backend for specific platform
build_backend_platform() {
    local platform="$1"
    local goos=$(get_platform_os "$platform")
    local goarch=$(get_platform_arch "$platform")
    local binary_ext=$(get_binary_ext "$platform")
    local output_dir="$BACKEND_DIR/$platform"
    local binary_name="task-api$binary_ext"
    
    print_platform "Building backend for $platform ($goos/$goarch)"
    
    if [ ! -d "$PROJECT_ROOT/task-api" ]; then
        print_error "Backend source directory not found: $PROJECT_ROOT/task-api"
        return 1
    fi
    
    cd "$PROJECT_ROOT/task-api"
    
    # Create output directory
    mkdir -p "$output_dir"
    
    # Build binary
    print_status "Building Go binary: $binary_name"
    CGO_ENABLED=0 GOOS="$goos" GOARCH="$goarch" go build \
        -ldflags="-w -s -X main.version=$VERSION -X main.buildTime=$BUILD_TIME -X main.gitCommit=$GIT_COMMIT" \
        -o "$output_dir/$binary_name" .
    
    if [ ! -f "$output_dir/$binary_name" ]; then
        print_error "Backend build failed for $platform - binary not found"
        return 1
    fi
    
    # Make executable (for Unix platforms)
    if [[ "$platform" != *"windows"* ]]; then
        chmod +x "$output_dir/$binary_name"
    fi
    
    print_success "Backend build completed for $platform"
    return 0
}

# Function to build backend for all platforms
build_backend_all() {
    print_header "Building Backend for All Platforms"
    
    cd "$PROJECT_ROOT/task-api"
    
    # Check if Go modules are initialized
    if [ ! -f "go.mod" ]; then
        print_status "Initializing Go modules..."
        go mod init task-api
    fi
    
    print_status "Installing Go dependencies..."
    go mod download
    
    print_status "Running Go tests..."
    go test -v ./...
    
    local failed_platforms=()
    
    for platform in $PLATFORMS; do
        if ! build_backend_platform "$platform"; then
            failed_platforms+=("$platform")
        fi
    done
    
    if [ ${#failed_platforms[@]} -ne 0 ]; then
        print_warning "Failed to build for platforms: ${failed_platforms[*]}"
        print_warning "Continuing with successful builds..."
    fi
    
    print_success "Backend builds completed"
}

# Function to create platform-specific startup script
create_startup_script() {
    local platform="$1"
    local package_dir="$2"
    local binary_ext=$(get_binary_ext "$platform")
    local script_ext=""
    local script_template=""
    
    if [[ "$platform" == *"windows"* ]]; then
        script_ext=".bat"
        script_template="windows"
    else
        script_ext=".sh"
        script_template="unix"
    fi
    
    local start_script="$package_dir/start$script_ext"
    local stop_script="$package_dir/stop$script_ext"
    
    if [ "$script_template" = "windows" ]; then
        # Windows batch scripts
        cat > "$start_script" << 'EOF'
@echo off
title Task Management Application

REM Task Management Application - Windows Startup Script
REM This script starts both the backend API and serves the frontend

echo Starting Task Management Application...

REM Check if required files exist
if not exist "backend\task-api.exe" (
    echo ERROR: Backend executable not found
    pause
    exit /b 1
)

if not exist "frontend\index.html" (
    echo ERROR: Frontend files not found
    pause
    exit /b 1
)

REM Load environment variables
if exist ".env.production" (
    echo Loading production environment...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.production") do (
        if not "%%a"=="" if not "%%a:~0,1%%"=="#" set %%a=%%b
    )
)

REM Create data directory
if not exist "data" mkdir data

REM Start backend API
echo Starting backend API...
start "Backend API" /min backend\task-api.exe

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Check if we have a simple HTTP server available
where /q python >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting frontend with Python HTTP server...
    cd frontend
    start "Frontend Server" python -m http.server 8090
    cd ..
) else (
    where /q node >nul 2>&1
    if %errorlevel% equ 0 (
        echo Starting frontend with Node.js HTTP server...
        cd frontend
        start "Frontend Server" npx http-server -p 8090
        cd ..
    ) else (
        echo WARNING: No HTTP server found. Please install Python or Node.js
        echo Or manually serve the frontend directory on port 8090
    )
)

echo.
echo Task Management Application is starting...
echo.
echo Frontend: http://localhost:8090
echo API: http://localhost:8081/api/health
echo.
echo Press any key to stop the application
pause >nul

REM Stop processes
taskkill /f /im task-api.exe 2>nul
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo Application stopped.
pause
EOF

        cat > "$stop_script" << 'EOF'
@echo off
title Stop Task Management Application

echo Stopping Task Management Application...

REM Kill backend processes
taskkill /f /im task-api.exe 2>nul
if %errorlevel% equ 0 echo Backend API stopped

REM Kill potential frontend servers
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo Application stopped successfully.
pause
EOF

    else
        # Unix shell scripts
        cat > "$start_script" << 'EOF'
#!/bin/bash

# Task Management Application - Unix Startup Script
# This script starts both the backend API and serves the frontend

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        print_status "Backend API stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        print_status "Frontend server stopped"
    fi
    
    exit 0
}

trap cleanup INT TERM

main() {
    print_status "Starting Task Management Application..."
    
    # Check required files
    if [ ! -f "$BACKEND_DIR/task-api" ]; then
        print_error "Backend executable not found"
        exit 1
    fi
    
    if [ ! -f "$FRONTEND_DIR/index.html" ]; then
        print_error "Frontend files not found"
        exit 1
    fi
    
    # Load environment variables
    if [ -f "$SCRIPT_DIR/.env.production" ]; then
        print_status "Loading production environment..."
        export $(cat "$SCRIPT_DIR/.env.production" | grep -v '^#' | grep -v '^$' | xargs)
    fi
    
    # Create data directory
    mkdir -p "$SCRIPT_DIR/data"
    
    # Start backend API
    print_status "Starting backend API..."
    cd "$BACKEND_DIR"
    ./task-api > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend
    sleep 3
    
    # Start frontend server
    cd "$FRONTEND_DIR"
    if command -v python3 >/dev/null 2>&1; then
        print_status "Starting frontend with Python HTTP server..."
        python3 -m http.server 8090 > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
    elif command -v python >/dev/null 2>&1; then
        print_status "Starting frontend with Python HTTP server..."
        python -m http.server 8090 > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
    elif command -v node >/dev/null 2>&1; then
        print_status "Starting frontend with Node.js HTTP server..."
        if command -v npx >/dev/null 2>&1; then
            npx http-server -p 8090 > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
            FRONTEND_PID=$!
        else
            print_error "Please install http-server: npm install -g http-server"
            exit 1
        fi
    else
        print_error "No HTTP server available. Please install Python or Node.js"
        exit 1
    fi
    
    sleep 2
    
    print_success "Task Management Application is now running!"
    print_status ""
    print_status "🌐 Application URL: http://localhost:8090"
    print_status "🔌 API Endpoint: http://localhost:8081/api"
    print_status "📊 Backend Health: http://localhost:8081/api/health"
    print_status ""
    print_status "Press Ctrl+C to stop the application"
    
    # Keep running
    while true; do
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            print_error "Backend API stopped unexpectedly"
            exit 1
        fi
        
        if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            print_error "Frontend server stopped unexpectedly"
            exit 1
        fi
        
        sleep 5
    done
}

main "$@"
EOF

        cat > "$stop_script" << 'EOF'
#!/bin/bash

# Task Management Application - Unix Stop Script

print_status() {
    echo "[INFO] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}

main() {
    print_status "Stopping Task Management Application..."
    
    # Kill by process name
    pkill -f "task-api" 2>/dev/null || true
    pkill -f "http.server" 2>/dev/null || true
    pkill -f "http-server" 2>/dev/null || true
    
    # Kill by port (backup)
    if command -v lsof >/dev/null 2>&1; then
        local pid8081=$(lsof -ti:8081 2>/dev/null || true)
        local pid8090=$(lsof -ti:8090 2>/dev/null || true)
        
        if [ -n "$pid8081" ]; then
            kill "$pid8081" 2>/dev/null || true
        fi
        
        if [ -n "$pid8090" ]; then
            kill "$pid8090" 2>/dev/null || true
        fi
    fi
    
    print_success "Application stopped successfully"
}

main "$@"
EOF

        chmod +x "$start_script" "$stop_script"
    fi
    
    print_success "Startup scripts created for $platform"
}

# Function to create platform-specific documentation
create_platform_docs() {
    local platform="$1"
    local package_dir="$2"
    local readme_file="$package_dir/README.md"
    local binary_ext=$(get_binary_ext "$platform")
    local script_ext=""
    local install_instructions=""
    
    if [[ "$platform" == *"windows"* ]]; then
        script_ext=".bat"
        install_instructions="
### Windows Installation

1. **Download and extract** the package to a folder like \`C:\\\\task-manage\`
2. **Open Command Prompt** as Administrator (for better compatibility)
3. **Navigate** to the extracted folder: \`cd C:\\\\task-manage\`
4. **Edit configuration**: Open \`.env.production\` in Notepad and set your encryption key
5. **Run the application**: Double-click \`start.bat\` or run \`start.bat\` from Command Prompt

### Windows Requirements

- Windows 10 or later
- Python 3.x or Node.js (for serving frontend files)
- 512MB RAM minimum
- Ports 8090 and 8081 available

### Windows Troubleshooting

- If you get \"Windows protected your PC\" warning, click \"More info\" → \"Run anyway\"
- Make sure Windows Defender isn't blocking the executable
- If ports are in use, check with: \`netstat -an | findstr :8090\`
"
    else
        script_ext=".sh"
        if [[ "$platform" == *"darwin"* ]]; then
            install_instructions="
### macOS Installation

1. **Download and extract** the package
2. **Open Terminal** and navigate to the extracted folder
3. **Make scripts executable**: \`chmod +x *.sh\`
4. **Edit configuration**: \`nano .env.production\` and set your encryption key
5. **Run the application**: \`./start.sh\`

### macOS Requirements

- macOS 10.15+ (Catalina or later)
- Python 3.x (usually pre-installed) or Node.js
- 512MB RAM minimum
- Ports 8090 and 8081 available

### macOS Troubleshooting

- If you get \"cannot be opened because it is from an unidentified developer\":
  - Right-click the \`task-api\` binary → \"Open With\" → \"Terminal\"
  - Or run: \`xattr -d com.apple.quarantine backend/task-api\`
- For permission issues: \`chmod +x backend/task-api\`
"
        else
            install_instructions="
### Linux Installation

1. **Download and extract** the package
2. **Open terminal** and navigate to the extracted folder
3. **Make scripts executable**: \`chmod +x *.sh\`
4. **Edit configuration**: \`nano .env.production\` and set your encryption key
5. **Run the application**: \`./start.sh\`

### Linux Requirements

- Linux kernel 3.2+ (most modern distributions)
- Python 3.x or Node.js
- 512MB RAM minimum
- Ports 8090 and 8081 available

### Linux Package Managers

Install HTTP server if needed:
\`\`\`bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3

# CentOS/RHEL/Fedora
sudo yum install python3  # or dnf install python3

# Arch Linux
sudo pacman -S python
\`\`\`
"
        fi
    fi
    
    cat > "$readme_file" << EOF
# Task Management Application - $platform

Production deployment package for $platform systems.

## Package Information

- **Version**: $VERSION
- **Build Time**: $BUILD_TIME
- **Git Commit**: $GIT_COMMIT
- **Platform**: $platform
- **Binary**: task-api$binary_ext

## 📦 Package Contents

\`\`\`
task-manage-$platform/
├── backend/
│   └── task-api$binary_ext           # Backend API server
├── frontend/                         # React application (built)
├── config/
│   └── .env.production              # Environment configuration
├── logs/                            # Application logs (created on startup)
├── start$script_ext                      # Application startup script
├── stop$script_ext                       # Application shutdown script
└── README.md                        # This file
\`\`\`

$install_instructions

## 🚀 Quick Start

### Basic Usage

1. **Configure encryption key** (REQUIRED):
   Edit \`.env.production\` and set:
   \`\`\`
   TASK_ENCRYPTION_KEY=your-secure-32-character-key-here
   \`\`\`

2. **Start the application**:
EOF

    if [[ "$platform" == *"windows"* ]]; then
        cat >> "$readme_file" << 'EOF'
   ```batch
   start.bat
   ```

3. **Stop the application**:
   ```batch
   stop.bat
   ```
EOF
    else
        cat >> "$readme_file" << 'EOF'
   ```bash
   ./start.sh
   ```

3. **Stop the application**:
   ```bash
   ./stop.sh
   ```
EOF
    fi

    cat >> "$readme_file" << 'EOF'

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
EOF

    print_success "Documentation created for $platform"
}

# Function to create platform package
create_platform_package() {
    local platform="$1"
    local binary_ext=$(get_binary_ext "$platform")
    local archive_ext=$(get_archive_ext "$platform")
    local package_name="task-manage-$VERSION-$platform"
    local package_dir="$BUILD_DIR/$package_name"
    local archive_name="$package_name$archive_ext"
    
    print_platform "Creating package for $platform"
    
    # Check if backend binary exists
    if [ ! -f "$BACKEND_DIR/$platform/task-api$binary_ext" ]; then
        print_error "Backend binary not found for $platform, skipping package creation"
        return 1
    fi
    
    # Create package directory structure
    mkdir -p "$package_dir/backend"
    mkdir -p "$package_dir/frontend"
    mkdir -p "$package_dir/config"
    mkdir -p "$package_dir/logs"
    
    # Copy backend binary
    cp "$BACKEND_DIR/$platform/task-api$binary_ext" "$package_dir/backend/"
    
    # Copy frontend files
    cp -r "$FRONTEND_DIR/"* "$package_dir/frontend/"
    
    # Create environment file
    cat > "$package_dir/.env.production" << EOF
# Task Management Application - Production Environment
# Platform: $platform

# REQUIRED: Encryption key for secure data storage (32+ characters)
TASK_ENCRYPTION_KEY=CHANGE-THIS-TO-A-SECURE-32-CHAR-KEY

# Server Configuration
PORT=8081
SERVER_HOST=localhost
GIN_MODE=release

# Storage Configuration
DATA_DIR=./data
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
EOF
    
    # Create startup scripts
    create_startup_script "$platform" "$package_dir"
    
    # Create documentation
    create_platform_docs "$platform" "$package_dir"
    
    # Create archive
    cd "$BUILD_DIR"
    if [[ "$platform" == *"windows"* ]]; then
        print_status "Creating ZIP archive: $archive_name"
        zip -r "$archive_name" "$package_name" >/dev/null
    else
        print_status "Creating TAR.GZ archive: $archive_name"
        tar -czf "$archive_name" "$package_name"
    fi
    
    # Calculate sizes
    local dir_size=$(du -sh "$package_name" | cut -f1)
    local archive_size=$(du -sh "$archive_name" | cut -f1)
    
    print_success "Package created: $archive_name ($archive_size, extracted: $dir_size)"
    
    cd "$PROJECT_ROOT"
    return 0
}

# Function to create all packages
create_all_packages() {
    print_header "Creating Platform Packages"
    
    # Copy frontend files to shared location
    mkdir -p "$FRONTEND_DIR"
    cp -r "$PROJECT_ROOT/dist/"* "$FRONTEND_DIR/"
    
    local successful_packages=()
    local failed_packages=()
    
    for platform in $PLATFORMS; do
        if create_platform_package "$platform"; then
            successful_packages+=("$platform")
        else
            failed_packages+=("$platform")
        fi
    done
    
    print_header "Package Creation Summary"
    
    if [ ${#successful_packages[@]} -ne 0 ]; then
        print_success "Successfully created packages:"
        for platform in "${successful_packages[@]}"; do
            local archive_ext=$(get_archive_ext "$platform")
            local archive_name="task-manage-$VERSION-$platform$archive_ext"
            local archive_size=$(du -sh "$BUILD_DIR/$archive_name" 2>/dev/null | cut -f1 || echo "Unknown")
            print_status "  ✓ $platform ($archive_size)"
        done
    fi
    
    if [ ${#failed_packages[@]} -ne 0 ]; then
        print_warning "Failed to create packages:"
        for platform in "${failed_packages[@]}"; do
            print_warning "  ✗ $platform"
        done
    fi
    
    # Create master README
    create_master_readme "${successful_packages[@]}"
}

# Function to create master README
create_master_readme() {
    local successful_packages=("$@")
    local readme_file="$BUILD_DIR/README.md"
    
    print_status "Creating master README..."
    
    cat > "$readme_file" << EOF
# Task Management Application - Cross-Platform Deployment

Multi-platform deployment packages for the Task Management Application with Eisenhower Matrix.

## 📦 Available Packages

$(for platform in "${successful_packages[@]}"; do
    local archive_ext=$(get_archive_ext "$platform")
    local archive_name="task-manage-$VERSION-$platform$archive_ext"
    local archive_size=$(du -sh "$BUILD_DIR/$archive_name" 2>/dev/null | cut -f1 || echo "Unknown")
    echo "- **$platform**: \`$archive_name\` ($archive_size)"
done)

## 🔧 Platform-Specific Instructions

### Windows (windows-amd64, windows-arm64)
- Extract the ZIP file
- Edit \`.env.production\` to set encryption key
- Run \`start.bat\` to launch the application
- Access at http://localhost:8090

### macOS (darwin-amd64, darwin-arm64)  
- Extract the TAR.GZ file
- Make scripts executable: \`chmod +x *.sh\`
- Edit \`.env.production\` to set encryption key
- Run \`./start.sh\` to launch the application
- Access at http://localhost:8090

### Linux (linux-amd64, linux-arm64)
- Extract the TAR.GZ file  
- Make scripts executable: \`chmod +x *.sh\`
- Edit \`.env.production\` to set encryption key
- Run \`./start.sh\` to launch the application
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

**IMPORTANT**: Before first run, edit \`.env.production\` in each package:

\`\`\`env
TASK_ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
\`\`\`

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
1. **Port conflicts**: Change ports in \`.env.production\` and startup scripts
2. **Permission denied**: Make sure scripts are executable (\`chmod +x\` on Unix)
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

Check the \`logs/\` directory in each package for troubleshooting information.

---

## Build Information

- **Version**: $VERSION
- **Build Time**: $(date -u)
- **Git Commit**: $GIT_COMMIT
- **Platforms**: ${#successful_packages[@]} packages created
- **Total Size**: $(du -sh "$BUILD_DIR" | cut -f1)

Built with ❤️ for cross-platform deployment.
EOF

    print_success "Master README created"
}

# Function to create deployment summary
create_deployment_summary() {
    print_header "Cross-Platform Deployment Summary"
    
    local total_size=$(du -sh "$BUILD_DIR" | cut -f1)
    local package_count=$(ls -1 "$BUILD_DIR"/*.tar.gz "$BUILD_DIR"/*.zip 2>/dev/null | wc -l)
    
    print_status "📊 Deployment Statistics:"
    print_status "  🔢 Total Packages: $package_count"
    print_status "  📁 Total Size: $total_size"
    print_status "  📍 Location: $BUILD_DIR"
    print_status "  🏷️  Version: $VERSION"
    print_status "  ⏰ Build Time: $BUILD_TIME"
    print_status "  🔗 Git Commit: $GIT_COMMIT"
    
    print_status ""
    print_status "📦 Created Packages:"
    
    for file in "$BUILD_DIR"/*.tar.gz "$BUILD_DIR"/*.zip; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local filesize=$(du -sh "$file" | cut -f1)
            print_status "  • $filename ($filesize)"
        fi
    done
    
    print_status ""
    print_success "🎉 Cross-platform deployment packages ready!"
    print_status ""
    print_status "📋 Next Steps:"
    print_status "  1. Test packages on target platforms"
    print_status "  2. Distribute packages to users"
    print_status "  3. Update encryption keys in production"
    print_status "  4. Monitor application logs"
    print_status ""
    print_status "📖 Documentation: $BUILD_DIR/README.md"
}

# Function to display help
show_help() {
    cat << EOF
Task Management Application - Cross-Platform Deployment Script

Usage: $0 [OPTIONS] [PLATFORMS...]

Options:
  -h, --help                  Show this help message
  -v, --version              Show version information
  -c, --clean                Clean build artifacts only
  --skip-frontend            Skip frontend build
  --skip-backend             Skip backend build
  --skip-tests              Skip Go tests during backend build

Platforms (if not specified, builds for all):
  linux-amd64               Linux x86_64
  linux-arm64               Linux ARM64
  darwin-amd64              macOS x86_64 (Intel)
  darwin-arm64              macOS ARM64 (Apple Silicon)
  windows-amd64             Windows x86_64
  windows-arm64             Windows ARM64

Examples:
  $0                        # Build all platforms
  $0 linux-amd64 darwin-amd64  # Build only Linux and macOS x64
  $0 --clean                # Clean build artifacts only
  $0 --skip-tests darwin-arm64  # Build macOS ARM64 without tests

Environment Variables:
  VERSION                   Override version number (default: $VERSION)
  SKIP_FRONTEND            Skip frontend build if set to 'true'
  SKIP_BACKEND             Skip backend build if set to 'true'
  SKIP_TESTS               Skip Go tests if set to 'true'
EOF
}

# Main function
main() {
    local selected_platforms=()
    local skip_frontend=false
    local skip_backend=false
    local skip_tests=false
    local clean_only=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                echo "Task Management Deployment Script v$VERSION"
                echo "Build Time: $BUILD_TIME"
                echo "Git Commit: $GIT_COMMIT"
                exit 0
                ;;
            -c|--clean)
                clean_only=true
                shift
                ;;
            --skip-frontend)
                skip_frontend=true
                shift
                ;;
            --skip-backend)
                skip_backend=true
                shift
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            linux-amd64|linux-arm64|darwin-amd64|darwin-arm64|windows-amd64|windows-arm64)
                selected_platforms+=("$1")
                shift
                ;;
            *)
                print_error "Unknown option or platform: $1"
                print_status "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Check environment variables
    if [ "$SKIP_FRONTEND" = "true" ]; then
        skip_frontend=true
    fi
    
    if [ "$SKIP_BACKEND" = "true" ]; then
        skip_backend=true
    fi
    
    if [ "$SKIP_TESTS" = "true" ]; then
        skip_tests=true
    fi
    
    # If no platforms selected, use all
    if [ ${#selected_platforms[@]} -eq 0 ]; then
        selected_platforms=($(printf '%s\n' $PLATFORMS | sort))
    fi
    
    # Show banner
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Task Management Application                               ║"
    echo "║                   Cross-Platform Deployment Script                          ║"
    echo "║                                                                              ║"
    echo "║  Builds deployment packages for Mac, Linux, and Windows systems             ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_status "Target platforms: ${selected_platforms[*]}"
    print_status "Version: $VERSION"
    print_status "Build time: $BUILD_TIME"
    print_status "Git commit: $GIT_COMMIT"
    
    # Execute deployment steps
    check_prerequisites "${selected_platforms[@]}"
    clean_builds
    
    if [ "$clean_only" = true ]; then
        print_success "Build artifacts cleaned successfully!"
        exit 0
    fi
    
    # Update PLATFORMS to only include selected ones
    local filtered_platforms=""
    for platform in "${selected_platforms[@]}"; do
        if echo "$PLATFORMS" | grep -wq "$platform"; then
            filtered_platforms="$filtered_platforms $platform"
        fi
    done
    PLATFORMS="$filtered_platforms"
    
    if [ "$skip_frontend" = false ]; then
        build_frontend
    else
        print_warning "Skipping frontend build"
    fi
    
    if [ "$skip_backend" = false ]; then
        if [ "$skip_tests" = true ]; then
            print_warning "Skipping Go tests"
            cd "$PROJECT_ROOT/task-api"
            print_status "Installing Go dependencies..."
            go mod download
        fi
        build_backend_all
    else
        print_warning "Skipping backend build"
    fi
    
    create_all_packages
    create_deployment_summary
    
    echo -e "\n${GREEN}🚀 Cross-platform deployment completed successfully! 🚀${NC}\n"
}

# Run main function with all arguments
main "$@"