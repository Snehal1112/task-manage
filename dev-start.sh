#!/bin/bash

# Task Management Application - Development Startup Script
# This script starts the development environment with Caddy, Backend API, and Frontend

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/task-api"
DEV_CONFIG_DIR="$SCRIPT_DIR/dev-config"

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

# Function to detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "macos"
            ;;
        Linux*)
            if [ -f /etc/debian_version ]; then
                echo "debian"
            elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ]; then
                echo "redhat"
            elif [ -f /etc/arch-release ]; then
                echo "arch"
            else
                echo "linux"
            fi
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Function to show installation instructions
show_install_instructions() {
    local dep="$1"
    local os="$2"
    
    print_status "Installation instructions for $dep:"
    echo ""
    
    case "$dep" in
        "Go")
            case "$os" in
                "macos")
                    echo "  Option 1 - Using Homebrew (recommended):"
                    echo "    brew install go"
                    echo ""
                    echo "  Option 2 - Download from official site:"
                    echo "    Visit: https://golang.org/dl/"
                    echo "    Download the macOS installer and follow the instructions"
                    ;;
                "debian")
                    echo "  Option 1 - Using package manager:"
                    echo "    sudo apt update"
                    echo "    sudo apt install golang-go"
                    echo ""
                    echo "  Option 2 - Download from official site (latest version):"
                    echo "    Visit: https://golang.org/dl/"
                    echo "    wget https://golang.org/dl/go1.21.0.linux-amd64.tar.gz"
                    echo "    sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz"
                    echo "    Add to ~/.bashrc: export PATH=\$PATH:/usr/local/go/bin"
                    ;;
                "redhat")
                    echo "  Option 1 - Using package manager:"
                    echo "    sudo yum install golang  # CentOS 7 / RHEL 7"
                    echo "    sudo dnf install golang  # CentOS 8+ / Fedora"
                    echo ""
                    echo "  Option 2 - Download from official site:"
                    echo "    Visit: https://golang.org/dl/"
                    ;;
                "arch")
                    echo "  Using package manager:"
                    echo "    sudo pacman -S go"
                    ;;
                "windows")
                    echo "  Option 1 - Using Chocolatey:"
                    echo "    choco install golang"
                    echo ""
                    echo "  Option 2 - Download from official site:"
                    echo "    Visit: https://golang.org/dl/"
                    echo "    Download the Windows installer and follow the instructions"
                    ;;
                *)
                    echo "  Visit: https://golang.org/dl/"
                    echo "  Download and install the appropriate package for your system"
                    ;;
            esac
            ;;
        "Caddy")
            case "$os" in
                "macos")
                    echo "  Option 1 - Using Homebrew (recommended):"
                    echo "    brew install caddy"
                    echo ""
                    echo "  Option 2 - Download binary:"
                    echo "    Visit: https://caddyserver.com/download"
                    ;;
                "debian")
                    echo "  Option 1 - Using official repository:"
                    echo "    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg"
                    echo "    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list"
                    echo "    sudo apt update"
                    echo "    sudo apt install caddy"
                    echo ""
                    echo "  Option 2 - Download binary:"
                    echo "    Visit: https://caddyserver.com/download"
                    ;;
                "redhat")
                    echo "  Option 1 - Using official repository:"
                    echo "    dnf install 'dnf-command(copr)'"
                    echo "    dnf copr enable @caddy/caddy"
                    echo "    dnf install caddy"
                    echo ""
                    echo "  Option 2 - Download binary:"
                    echo "    Visit: https://caddyserver.com/download"
                    ;;
                "arch")
                    echo "  Using AUR:"
                    echo "    yay -S caddy"
                    echo "    # or"
                    echo "    git clone https://aur.archlinux.org/caddy.git"
                    echo "    cd caddy && makepkg -si"
                    ;;
                "windows")
                    echo "  Option 1 - Using Chocolatey:"
                    echo "    choco install caddy"
                    echo ""
                    echo "  Option 2 - Using Scoop:"
                    echo "    scoop install caddy"
                    echo ""
                    echo "  Option 3 - Download binary:"
                    echo "    Visit: https://caddyserver.com/download"
                    ;;
                *)
                    echo "  Visit: https://caddyserver.com/download"
                    echo "  Download and install the appropriate binary for your system"
                    ;;
            esac
            ;;
    esac
    echo ""
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
    print_header "Shutting Down Development Environment"
    
    # Kill backend if running
    if [ ! -z "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        print_status "Backend API stopped"
    fi
    
    # Kill Caddy if running
    if [ ! -z "$CADDY_PID" ] && kill -0 "$CADDY_PID" 2>/dev/null; then
        kill "$CADDY_PID"
        print_status "Caddy development server stopped"
    fi
    
    # Kill frontend if running
    if [ ! -z "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        print_status "Vite development server stopped"
    fi
    
    print_success "Development environment stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Main startup sequence
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Task Management Application                               ║"
    echo "║                      Development Environment                                 ║"
    echo "║                                                                              ║"
    echo "║  Starting Caddy + Backend API + Frontend Development Server                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Check prerequisites
    print_header "Checking Prerequisites"
    
    # Detect operating system
    local os=$(detect_os)
    print_status "Detected OS: $os"
    
    local missing_deps=()
    local missing_go=false
    local missing_caddy=false
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists yarn; then
        missing_deps+=("Yarn")
    fi
    
    if ! command_exists go; then
        missing_deps+=("Go")
        missing_go=true
    fi
    
    if ! command_exists caddy; then
        missing_deps+=("Caddy")
        missing_caddy=true
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        print_status "📋 Installation Guide for Missing Dependencies:"
        echo ""
        
        # Show specific installation instructions for Go and Caddy
        if [ "$missing_go" = true ]; then
            show_install_instructions "Go" "$os"
        fi
        
        if [ "$missing_caddy" = true ]; then
            show_install_instructions "Caddy" "$os"
        fi
        
        # Show instructions for Node.js and Yarn if missing
        for dep in "${missing_deps[@]}"; do
            case "$dep" in
                "Node.js")
                    print_status "Installation instructions for Node.js:"
                    echo ""
                    case "$os" in
                        "macos")
                            echo "  Option 1 - Using Homebrew:"
                            echo "    brew install node"
                            echo ""
                            echo "  Option 2 - Using Node Version Manager (recommended):"
                            echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
                            echo "    nvm install --lts && nvm use --lts"
                            ;;
                        "debian"|"redhat")
                            echo "  Option 1 - Using Node Version Manager (recommended):"
                            echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
                            echo "    nvm install --lts && nvm use --lts"
                            echo ""
                            echo "  Option 2 - Using package manager:"
                            if [ "$os" = "debian" ]; then
                                echo "    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
                                echo "    sudo apt-get install -y nodejs"
                            else
                                echo "    curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -"
                                echo "    sudo dnf install nodejs npm"
                            fi
                            ;;
                        "windows")
                            echo "  Option 1 - Download from official site:"
                            echo "    Visit: https://nodejs.org/en/download/"
                            echo ""
                            echo "  Option 2 - Using Chocolatey:"
                            echo "    choco install nodejs"
                            ;;
                        *)
                            echo "  Visit: https://nodejs.org/en/download/"
                            ;;
                    esac
                    echo ""
                    ;;
                "Yarn")
                    print_status "Installation instructions for Yarn:"
                    echo ""
                    echo "  After installing Node.js, install Yarn:"
                    echo "    npm install -g yarn"
                    echo ""
                    echo "  Or visit: https://yarnpkg.com/getting-started/install"
                    echo ""
                    ;;
            esac
        done
        
        print_status "After installing the missing dependencies, please:"
        print_status "1. Close and reopen your terminal (or run: source ~/.bashrc)"
        print_status "2. Verify installations with: go version && caddy version && node --version && yarn --version"
        print_status "3. Run this script again: ./dev-start.sh"
        echo ""
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
    
    # Show version information
    print_status "Installed versions:"
    if command_exists go; then
        print_status "  Go: $(go version | cut -d' ' -f3)"
    fi
    if command_exists caddy; then
        print_status "  Caddy: $(caddy version | head -1)"
    fi
    if command_exists node; then
        print_status "  Node.js: $(node --version)"
    fi
    if command_exists yarn; then
        print_status "  Yarn: $(yarn --version)"
    fi
    
    # Check ports availability
    print_header "Checking Port Availability"
    
    if ! port_available 8080; then
        print_warning "Port 8080 is in use. Backend will try to start anyway."
    fi
    
    if ! port_available 5173; then
        print_warning "Port 5173 is in use. Vite might use an alternative port."
    fi
    
    if ! port_available 3000; then
        print_warning "Port 3000 is in use. Caddy development proxy available on port 8090."
    fi
    
    # Create dev data directory
    mkdir -p "$SCRIPT_DIR/task-api/dev-data"
    
    # Start backend API
    print_header "Starting Backend API"
    cd "$API_DIR"
    
    # Load development environment
    if [ -f "$DEV_CONFIG_DIR/.env.development" ]; then
        # Export environment variables for the current shell and subprocesses
        set -a
        source "$DEV_CONFIG_DIR/.env.development"
        set +a
        print_status "Loaded development environment configuration"
    fi
    
    print_status "Starting Go backend API on port 8080..."
    # Use exec to ensure environment variables are passed to the Go process
    go run . > dev-backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    if command_exists curl; then
        wait_for_service "http://localhost:8080/api/health" "Backend API"
    else
        print_status "Waiting 3 seconds for backend to start..."
        sleep 3
    fi
    
    # Start frontend development server
    print_header "Starting Frontend Development Server"
    cd "$SCRIPT_DIR"
    
    print_status "Installing frontend dependencies..."
    yarn install --silent
    
    print_status "Starting Vite development server..."
    yarn dev > dev-frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    sleep 3
    
    # Start Caddy development proxy
    print_header "Starting Caddy Development Proxy"
    
    print_status "Starting Caddy on ports 3000 and 8090..."
    caddy run --config "$DEV_CONFIG_DIR/Caddyfile.dev" > dev-caddy.log 2>&1 &
    CADDY_PID=$!
    
    # Wait for Caddy to be ready
    if command_exists curl; then
        wait_for_service "http://localhost:3000" "Caddy development proxy"
    else
        print_status "Waiting 3 seconds for Caddy to start..."
        sleep 3
    fi
    
    # Display success message
    print_header "Development Environment Ready"
    print_success "All services are running!"
    print_status ""
    print_status "🌐 Frontend Development URLs:"
    print_status "   - Direct Vite Server: http://localhost:5173"
    print_success "   ➤ Via Caddy Proxy:    http://localhost:3000  ⭐ RECOMMENDED"
    print_status "   - Production-like:    http://localhost:8090"
    print_status ""
    print_status "🔌 Backend API:"
    print_status "   - Direct Access:      http://localhost:8080/api"
    print_success "   ➤ Via Caddy Proxy:    http://localhost:3000/api  ⭐ RECOMMENDED"
    print_status "   - Health Check:       http://localhost:3000/api/health"
    print_status ""
    print_status "⚙️  Development Tools:"
    print_status "   - Caddy Admin:        http://localhost:2019"
    print_status "   - Hot Reload:         ✅ Enabled (Vite + Go air if installed)"
    print_status "   - Debug Mode:         ✅ Enabled"
    print_status ""
    print_status "📝 Development Logs:"
    print_status "   - Backend:            tail -f task-api/dev-backend.log"
    print_status "   - Frontend:           tail -f dev-frontend.log"
    print_status "   - Caddy:              tail -f dev-caddy.log"
    print_status ""
    echo -e "${GREEN}💡 RECOMMENDED:${NC} Use ${GREEN}http://localhost:3000${NC} for consistent development experience"
    print_status ""
    print_status "Press Ctrl+C to stop all development servers"
    
    # Keep the script running
    while true; do
        # Check if processes are still running
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            print_error "Backend API has stopped unexpectedly"
            print_status "Check logs: tail task-api/dev-backend.log"
            exit 1
        fi
        
        if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            print_error "Frontend server has stopped unexpectedly"
            print_status "Check logs: tail dev-frontend.log"
            exit 1
        fi
        
        if ! kill -0 "$CADDY_PID" 2>/dev/null; then
            print_error "Caddy has stopped unexpectedly"
            print_status "Check logs: tail dev-caddy.log"
            exit 1
        fi
        
        sleep 5
    done
}

# Run main function
main "$@"