#!/bin/bash

# Task Management Application - Development Stop Script
# This script stops all development services

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
        while [ $count -lt 5 ] && kill -0 "$pid" 2>/dev/null; do
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
    print_status "Stopping Development Environment..."
    
    # Stop development servers by port
    kill_process_on_port 3000 "Caddy development proxy (port 3000)"
    kill_process_on_port 8090 "Caddy development proxy (port 8090)"
    kill_process_on_port 5173 "Vite development server"
    kill_process_on_port 8080 "Go backend API"
    kill_process_on_port 2019 "Caddy admin interface"
    
    # Also try to kill by process name as backup
    print_status "Checking for any remaining development processes..."
    
    # Kill any remaining Caddy processes
    pkill -f "caddy run.*Caddyfile.dev" 2>/dev/null || true
    
    # Kill any remaining Go processes for this project
    pkill -f "go run.*task-api" 2>/dev/null || true
    
    # Kill any remaining Vite processes
    pkill -f "vite.*dev" 2>/dev/null || true
    
    print_success "All development services stopped successfully"
    
    # Clean up log files if they exist
    if [ -f "dev-frontend.log" ] || [ -f "dev-caddy.log" ] || [ -f "task-api/dev-backend.log" ]; then
        print_status "Development log files available:"
        [ -f "dev-frontend.log" ] && echo "  - dev-frontend.log"
        [ -f "dev-caddy.log" ] && echo "  - dev-caddy.log" 
        [ -f "task-api/dev-backend.log" ] && echo "  - task-api/dev-backend.log"
        print_status "Run 'rm *dev*.log task-api/dev-backend.log' to clean up logs"
    fi
}

main "$@"