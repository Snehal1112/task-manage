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
    echo "║  Starting Caddy + Backend API + Frontend Development Server                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Check prerequisites
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
    
    if ! command_exists caddy; then
        missing_deps+=("Caddy")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
    
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
    print_status "   - Via Caddy Proxy:    http://localhost:3000"
    print_status "   - Production-like:    http://localhost:8090"
    print_status ""
    print_status "🔌 Backend API:"
    print_status "   - Direct Access:      http://localhost:8080/api"
    print_status "   - Via Caddy Proxy:    http://localhost:3000/api"
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
    print_status "💡 Recommended: Use http://localhost:3000 for consistent development experience"
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