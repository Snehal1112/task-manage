#!/bin/bash

# Task Management Application - Deployment Script
# This script creates a complete production deployment package

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$PROJECT_ROOT/deployment-package"
FRONTEND_DIR="$BUILD_DIR/frontend"
BACKEND_DIR="$BUILD_DIR/backend"
CONFIG_DIR="$BUILD_DIR/config"
LOGS_DIR="$BUILD_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Function to clean previous builds
clean_builds() {
    print_header "Cleaning Previous Builds"
    
    # Remove previous deployment package
    if [ -d "$BUILD_DIR" ]; then
        print_status "Removing previous deployment package..."
        rm -rf "$BUILD_DIR"
    fi
    
    # Clean frontend build artifacts
    if [ -d "$PROJECT_ROOT/dist" ]; then
        print_status "Cleaning frontend build artifacts..."
        rm -rf "$PROJECT_ROOT/dist"
    fi
    
    # Clean node modules cache
    if [ -d "$PROJECT_ROOT/node_modules/.cache" ]; then
        print_status "Cleaning node modules cache..."
        rm -rf "$PROJECT_ROOT/node_modules/.cache"
    fi
    
    print_success "Build artifacts cleaned"
}

# Function to ensure clean environment configuration
prepare_environment() {
    print_header "Preparing Build Environment"
    
    # Backup current .env if it exists
    if [ -f "$PROJECT_ROOT/.env" ]; then
        print_status "Backing up current .env file..."
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup"
    fi
    
    # Create production-ready .env (commenting out dev API URL)
    print_status "Configuring environment for production build..."
    cat > "$PROJECT_ROOT/.env" << EOF
# Development API Configuration
# VITE_API_BASE_URL=http://localhost:8080/api
# Commented out to use relative URLs for production build
EOF
    
    print_success "Environment prepared for production build"
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

# Function to build backend
build_backend() {
    print_header "Building Backend API"
    
    cd "$PROJECT_ROOT/task-api"
    
    print_status "Installing Go dependencies..."
    go mod download
    
    print_status "Running Go tests..."
    go test -v ./...
    
    # Detect current OS and architecture
    local target_os=$(go env GOOS)
    local target_arch=$(go env GOARCH)
    
    print_status "Building Go binary for $target_os/$target_arch..."
    CGO_ENABLED=0 GOOS="$target_os" GOARCH="$target_arch" go build \
        -ldflags="-w -s -X main.version=production -X main.buildTime=$(date -u +%Y%m%d%H%M%S)" \
        -o task-api .
    
    if [ ! -f "task-api" ]; then
        print_error "Backend build failed - binary not found"
        exit 1
    fi
    
    print_success "Backend build completed successfully for $target_os/$target_arch"
}

# Function to create deployment structure
create_deployment_structure() {
    print_header "Creating Deployment Package Structure"
    
    # Create directory structure
    mkdir -p "$FRONTEND_DIR" "$BACKEND_DIR" "$CONFIG_DIR" "$LOGS_DIR"
    
    print_status "Directory structure created:"
    print_status "  $BUILD_DIR/"
    print_status "  ├── frontend/"
    print_status "  ├── backend/"
    print_status "  ├── config/"
    print_status "  └── logs/"
}

# Function to copy frontend files
copy_frontend() {
    print_header "Copying Frontend Files"
    
    print_status "Copying React build artifacts..."
    cp -r "$PROJECT_ROOT/dist/"* "$FRONTEND_DIR/"
    
    # Verify critical files
    if [ ! -f "$FRONTEND_DIR/index.html" ]; then
        print_error "Frontend copy failed - index.html not found"
        exit 1
    fi
    
    print_success "Frontend files copied successfully"
}

# Function to copy backend files
copy_backend() {
    print_header "Copying Backend Files"
    
    print_status "Copying Go binary..."
    cp "$PROJECT_ROOT/task-api/task-api" "$BACKEND_DIR/"
    chmod +x "$BACKEND_DIR/task-api"
    
    # Verify binary
    if [ ! -x "$BACKEND_DIR/task-api" ]; then
        print_error "Backend copy failed - executable not found"
        exit 1
    fi
    
    print_success "Backend files copied successfully"
}

# Function to create configuration files
create_configuration() {
    print_header "Creating Configuration Files"
    
    # Create Caddyfile
    print_status "Creating Caddyfile..."
    cat > "$CONFIG_DIR/Caddyfile" << 'EOF'
# Task Management Application - Production Caddyfile
# Serves the React frontend and reverse proxies API calls to Go backend

# Global configuration
{
    admin off
    auto_https off
}

# Main server block for port 8090
:8090 {
    # Serve React frontend files
    handle /* {
        root * {$PWD}/frontend
        try_files {path} /index.html
        file_server
    }

    # Reverse proxy for API calls
    handle /api/* {
        reverse_proxy localhost:8081
    }

    # Security headers
    header {
        # CORS headers for API access
        Access-Control-Allow-Origin "http://localhost:8090"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization, Accept"
        Access-Control-Allow-Credentials "true"
        
        # Security headers
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # Content Security Policy - Fixed to allow API connections
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self'"
        
        # Permissions Policy
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    # Handle preflight OPTIONS requests
    @options method OPTIONS
    handle @options {
        header Access-Control-Allow-Origin "http://localhost:8090"
        header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        header Access-Control-Allow-Headers "Content-Type, Authorization, Accept"
        header Access-Control-Allow-Credentials "true"
        respond "" 204
    }

    # Logging
    log {
        output file {$PWD}/logs/access.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
EOF

    # Create environment file
    print_status "Creating .env.production..."
    cat > "$BUILD_DIR/.env.production" << 'EOF'
# Task Management Application - Production Environment
# This file contains production configuration for the backend API

# REQUIRED: Encryption key for secure data storage (must be 32+ characters)
# IMPORTANT: Change this to a secure random key for production use
TASK_ENCRYPTION_KEY=CHANGE-THIS-TO-A-SECURE-32-CHAR-KEY

# Server Configuration
PORT=8081
SERVER_HOST=localhost
GIN_MODE=release

# CORS Configuration (frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:8090,https://your-domain.com

# Storage Configuration
DATA_DIR=./data
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
EOF
    
    print_success "Configuration files created"
}

# Function to create startup scripts
create_scripts() {
    print_header "Creating Startup Scripts"
    
    # Create start script
    print_status "Creating start.sh..."
    cat > "$BUILD_DIR/start.sh" << 'EOF'
#!/bin/bash

# Task Management Application - Production Startup Script
# This script starts both the backend API and the Caddy web server

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
CONFIG_DIR="$SCRIPT_DIR/config"
LOGS_DIR="$SCRIPT_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! nc -z localhost "$1" 2>/dev/null
}

# Function to wait for service to be ready
wait_for_service() {
    local url="$1"
    local service_name="$2"
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        printf "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within ${max_attempts} seconds"
    return 1
}

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down services..."
    
    # Kill backend if running
    if [ ! -z "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        print_status "Backend API stopped"
    fi
    
    # Kill Caddy if running
    if [ ! -z "$CADDY_PID" ] && kill -0 "$CADDY_PID" 2>/dev/null; then
        kill "$CADDY_PID"
        print_status "Caddy web server stopped"
    fi
    
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Main startup sequence
main() {
    print_status "Starting Task Management Application..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check if Caddy is installed
    if ! command_exists caddy; then
        print_error "Caddy is not installed. Please install Caddy first."
        print_status "Install instructions: https://caddyserver.com/docs/install"
        exit 1
    fi
    
    # Check if curl is available for health checks
    if ! command_exists curl; then
        print_warning "curl is not available. Health checks will be skipped."
    fi
    
    # Create necessary directories
    mkdir -p "$LOGS_DIR"
    mkdir -p "$SCRIPT_DIR/data"
    
    # Load environment variables
    if [ -f "$SCRIPT_DIR/.env.production" ]; then
        print_status "Loading production environment configuration..."
        export $(cat "$SCRIPT_DIR/.env.production" | grep -v '^#' | grep -v '^$' | xargs)
    else
        print_warning "No .env.production file found. Using default configuration."
    fi
    
    # Validate encryption key
    if [ -z "$TASK_ENCRYPTION_KEY" ] || [ ${#TASK_ENCRYPTION_KEY} -lt 32 ]; then
        print_error "TASK_ENCRYPTION_KEY is required and must be at least 32 characters long."
        print_status "Please set TASK_ENCRYPTION_KEY in .env.production file."
        exit 1
    fi
    
    # Check if encryption key is still the default
    if [ "$TASK_ENCRYPTION_KEY" = "CHANGE-THIS-TO-A-SECURE-32-CHAR-KEY" ]; then
        print_warning "Using default encryption key. Please change it for production use."
    fi
    
    # Check ports availability
    if ! port_available 8081; then
        print_error "Port 8081 is already in use. Please stop the service using this port."
        exit 1
    fi
    
    if ! port_available 8090; then
        print_error "Port 8090 is already in use. Please stop the service using this port."
        exit 1
    fi
    
    # Start backend API
    print_status "Starting backend API on port 8081..."
    cd "$BACKEND_DIR"
    ./task-api > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    if command_exists curl; then
        wait_for_service "http://localhost:8081/api/health" "Backend API"
    else
        print_status "Waiting 3 seconds for backend to start..."
        sleep 3
    fi
    
    # Start Caddy web server
    print_status "Starting Caddy web server on port 8090..."
    cd "$SCRIPT_DIR"
    PWD="$SCRIPT_DIR" caddy run --config "$CONFIG_DIR/Caddyfile" > "$LOGS_DIR/caddy.log" 2>&1 &
    CADDY_PID=$!
    
    # Wait for Caddy to be ready
    if command_exists curl; then
        wait_for_service "http://localhost:8090" "Caddy web server"
    else
        print_status "Waiting 3 seconds for Caddy to start..."
        sleep 3
    fi
    
    # Display success message
    print_success "Task Management Application is now running!"
    print_status ""
    print_status "🌐 Application URL: http://localhost:8090"
    print_status "🔌 API Endpoint: http://localhost:8090/api"
    print_status "📊 Backend Health: http://localhost:8090/api/health"
    print_status ""
    print_status "📝 Logs:"
    print_status "  - Backend: $LOGS_DIR/backend.log"
    print_status "  - Caddy: $LOGS_DIR/caddy.log"
    print_status "  - Access: $LOGS_DIR/access.log"
    print_status ""
    print_status "⚠️  IMPORTANT: Make sure to change TASK_ENCRYPTION_KEY in .env.production"
    print_status ""
    print_status "Press Ctrl+C to stop the application"
    
    # Keep the script running
    while true; do
        # Check if processes are still running
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            print_error "Backend API has stopped unexpectedly"
            exit 1
        fi
        
        if ! kill -0 "$CADDY_PID" 2>/dev/null; then
            print_error "Caddy web server has stopped unexpectedly"
            exit 1
        fi
        
        sleep 5
    done
}

# Run main function
main "$@"
EOF

    # Create stop script
    print_status "Creating stop.sh..."
    cat > "$BUILD_DIR/stop.sh" << 'EOF'
#!/bin/bash

# Task Management Application - Stop Script
# This script stops the running application services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to kill process by port
kill_process_on_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pid" ]; then
        print_status "Stopping $service_name (PID: $pid)..."
        kill -TERM "$pid" 2>/dev/null || true
        
        # Wait for graceful shutdown
        local count=0
        while [ $count -lt 10 ] && kill -0 "$pid" 2>/dev/null; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            print_warning "Force killing $service_name..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
        
        print_success "$service_name stopped"
    else
        print_status "$service_name is not running on port $port"
    fi
}

main() {
    print_status "Stopping Task Management Application..."
    
    # Stop Caddy web server (port 8090)
    kill_process_on_port 8090 "Caddy web server"
    
    # Stop backend API (port 8081)  
    kill_process_on_port 8081 "Backend API"
    
    # Also try to kill by process name as backup
    print_status "Checking for any remaining processes..."
    
    # Kill any remaining Caddy processes
    pkill -f "caddy run" 2>/dev/null || true
    
    # Kill any remaining task-api processes
    pkill -f "task-api" 2>/dev/null || true
    
    print_success "All services stopped successfully"
}

main "$@"
EOF

    # Make scripts executable
    chmod +x "$BUILD_DIR/start.sh" "$BUILD_DIR/stop.sh"
    
    print_success "Startup scripts created and made executable"
}

# Function to create README
create_readme() {
    print_header "Creating Documentation"
    
    print_status "Creating README.md..."
    cat > "$BUILD_DIR/README.md" << EOF
# Task Management Application - Production Deployment

This is a complete production-ready deployment package for the Task Management Application with Eisenhower Matrix functionality. The application includes a React frontend, Go backend API with encrypted file storage, and Caddy web server for reverse proxy.

## 📦 Package Contents

\`\`\`
deployment-package/
├── frontend/           # React application (built)
├── backend/            # Go API server binary
├── config/             # Caddy configuration
├── logs/               # Application logs (created on startup)
├── .env.production     # Environment configuration
├── start.sh           # Application startup script
├── stop.sh            # Application shutdown script
└── README.md          # This file
\`\`\`

## 🚀 Quick Start

### Prerequisites

1. **Caddy Web Server** (required)
   \`\`\`bash
   # Install Caddy (choose your platform)
   # Ubuntu/Debian:
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   
   # Or download binary from: https://caddyserver.com/download
   \`\`\`

2. **System Requirements**
   - Linux x64 system
   - 512MB RAM minimum (1GB+ recommended)
   - 100MB disk space
   - Ports 8090 and 8081 available

### Installation & Configuration

1. **Extract and navigate to the package**
   \`\`\`bash
   cd deployment-package
   \`\`\`

2. **Configure encryption key** (REQUIRED)
   \`\`\`bash
   # Edit .env.production file
   nano .env.production
   
   # Change the encryption key to a secure 32+ character string:
   TASK_ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
   \`\`\`

3. **Start the application**
   \`\`\`bash
   ./start.sh
   \`\`\`

4. **Access the application**
   - Open your browser: http://localhost:8090
   - API health check: http://localhost:8090/api/health

### Stopping the Application

\`\`\`bash
./stop.sh
\`\`\`

## 🔧 Configuration

### Environment Variables (.env.production)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| \`TASK_ENCRYPTION_KEY\` | Encryption key for data storage (32+ chars) | - | ✅ |
| \`PORT\` | Backend API port | 8081 | ❌ |
| \`SERVER_HOST\` | Backend bind address | localhost | ❌ |
| \`CORS_ALLOWED_ORIGINS\` | Allowed CORS origins | localhost:8090 | ❌ |
| \`DATA_DIR\` | Data storage directory | ./data | ❌ |
| \`BACKUP_RETENTION_DAYS\` | Backup retention period | 30 | ❌ |
| \`LOG_LEVEL\` | Logging level | info | ❌ |
| \`GIN_MODE\` | Go Gin framework mode | release | ❌ |

### Port Configuration

- **Frontend (Caddy)**: Port 8090 (configurable in Caddyfile)
- **Backend API**: Port 8081 (configurable in .env.production)

To change ports:
1. Update \`PORT\` in \`.env.production\`
2. Update the reverse_proxy port in \`config/Caddyfile\`
3. Update the main server port in \`config/Caddyfile\`

## 🔐 Security Features

- **AES-256-GCM encryption** for all task data
- **PBKDF2 key derivation** with 100,000 iterations
- **Automatic backup system** with encrypted storage
- **Security headers** via Caddy (XSS, CSRF protection)
- **Input validation** at all API layers
- **File locking** to prevent data corruption
- **Content Security Policy** configured for API access

## 📊 Data Storage

- **Location**: \`./data/\` directory (configurable)
- **Format**: AES-256-GCM encrypted JSON files
- **Backups**: Automatic daily backups with configurable retention
- **No Database Required**: File-based storage system

## 🔧 Troubleshooting

### Common Issues

1. **"Content Security Policy" error**
   - The Caddyfile has been configured to allow API connections
   - Ensure you're accessing the app through http://localhost:8090

2. **"Port already in use" error**
   \`\`\`bash
   # Check what's using the ports
   sudo lsof -i :8090
   sudo lsof -i :8081
   
   # Kill processes or change ports in configuration
   \`\`\`

3. **API connection errors**
   - Frontend uses relative URLs (/api) for production
   - Ensure both Caddy and backend are running
   - Check logs in \`logs/\` directory

4. **"Caddy command not found"**
   - Install Caddy following the prerequisites section
   - Or download binary and add to PATH

### Health Checks

- **Backend Health**: http://localhost:8090/api/health
- **API Status**: http://localhost:8090/api/tasks (should return task list)
- **Frontend**: http://localhost:8090 (should load React app)

## 📝 Application Features

### Key Features
- **Task Management**: Create, edit, delete tasks with title, description, due dates, and priority flags
- **Task Editing**: Full edit functionality available from both Task Panel and Matrix quadrants with pre-filled modal forms
- **Eisenhower Matrix**: Drag tasks into four quadrants (Do, Schedule, Delegate, Delete) with properly aligned axis labels
- **Enhanced Drag & Drop**: Smooth animations, visual placeholders, drop zone highlighting, and improved visual feedback
- **Custom Scrollbars**: Show-on-hover scrollbars for better UX in both Task Panel and Matrix quadrants
- **Automatic Categorization**: Tasks automatically update urgency/importance flags based on quadrant placement
- **Persistent Storage**: Tasks are saved with encrypted file storage
- **Responsive Design**: Works on desktop and mobile devices

### Testing the Application

After starting with \`./start.sh\`, you should be able to:

1. **Access the frontend** at http://localhost:8090
2. **Create tasks** using the task form
3. **Drag tasks** into different Eisenhower Matrix quadrants
4. **Edit and delete tasks** from both the task panel and matrix
5. **See data persist** after restarting the application

All data is automatically encrypted and stored securely with AES-256-GCM encryption.

---

**Build Date**: $(date)  
**Architecture**: Linux x64  
**Dependencies**: Caddy v2+

**Key Features in this deployment:**
- Fixed CSP blocking API calls
- Corrected frontend API endpoints for production
- Updated all documentation with correct ports
- Production-ready encrypted file storage
- Complete reverse proxy setup with Caddy
EOF

    print_success "README.md created with comprehensive documentation"
}

# Function to restore environment
restore_environment() {
    print_header "Restoring Development Environment"
    
    # Restore original .env if backup exists
    if [ -f "$PROJECT_ROOT/.env.backup" ]; then
        print_status "Restoring original .env file..."
        mv "$PROJECT_ROOT/.env.backup" "$PROJECT_ROOT/.env"
    fi
    
    print_success "Development environment restored"
}

# Function to create deployment summary
create_summary() {
    print_header "Deployment Package Summary"
    
    local package_size=$(du -sh "$BUILD_DIR" | cut -f1)
    local frontend_files=$(find "$FRONTEND_DIR" -type f | wc -l)
    local backend_size=$(du -sh "$BACKEND_DIR/task-api" | cut -f1)
    
    print_status "Package Information:"
    print_status "  📦 Package Size: $package_size"
    print_status "  🖥️  Frontend Files: $frontend_files files"
    print_status "  ⚙️  Backend Binary: $backend_size"
    print_status "  📁 Package Location: $BUILD_DIR"
    print_status ""
    print_status "Quick Start Commands:"
    print_status "  cd $BUILD_DIR"
    print_status "  # Edit .env.production (set TASK_ENCRYPTION_KEY)"
    print_status "  ./start.sh"
    print_status ""
    print_success "Deployment package created successfully!"
}

# Main deployment function
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Task Management Application                               ║"
    echo "║                         Deployment Script                                    ║"
    echo "║                                                                              ║"
    echo "║  This script creates a complete production deployment package                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Execute deployment steps
    check_prerequisites
    clean_builds
    prepare_environment
    build_frontend
    build_backend
    create_deployment_structure
    copy_frontend
    copy_backend
    create_configuration
    create_scripts
    create_readme
    restore_environment
    create_summary
    
    echo -e "\n${GREEN}🎉 Deployment package ready for distribution! 🎉${NC}\n"
}

# Run main function
main "$@"