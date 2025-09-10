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
