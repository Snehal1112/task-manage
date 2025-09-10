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
