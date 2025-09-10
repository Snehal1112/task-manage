#!/bin/bash

# Task Management Application - Deployment Validation Script
# Tests deployment packages to ensure they work correctly

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$SCRIPT_DIR/validation-tests"
DEPLOYMENT_DIR="$SCRIPT_DIR/deployment-packages"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Test results tracking (compatible with bash 3.2+)
TEST_RESULTS_NAMES=""
TEST_RESULTS_STATUS=""
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions for test results
add_test_result() {
    local name="$1"
    local status="$2"
    TEST_RESULTS_NAMES="$TEST_RESULTS_NAMES $name"
    TEST_RESULTS_STATUS="$TEST_RESULTS_STATUS $status"
}

get_test_result() {
    local name="$1"
    local i=1
    for test_name in $TEST_RESULTS_NAMES; do
        if [ "$test_name" = "$name" ]; then
            echo "$TEST_RESULTS_STATUS" | cut -d' ' -f$i
            return
        fi
        i=$((i + 1))
    done
}

# Print functions
print_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test tracking functions
start_test() {
    local test_name="$1"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"
}

pass_test() {
    local test_name="$1"
    add_test_result "$test_name" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    print_success "$test_name"
}

fail_test() {
    local test_name="$1"
    local reason="$2"
    add_test_result "$test_name" "FAIL: $reason"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    print_error "$test_name - $reason"
}

# Utility functions
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

wait_for_port() {
    local port="$1"
    local timeout="$2"
    local count=0
    
    while [ $count -lt $timeout ]; do
        if nc -z localhost "$port" 2>/dev/null; then
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    return 1
}

cleanup_processes() {
    # Kill any test processes
    pkill -f "test-task-api" 2>/dev/null || true
    pkill -f "http.server" 2>/dev/null || true
    pkill -f "http-server" 2>/dev/null || true
    
    # Wait a moment for cleanup
    sleep 2
}

# Test functions
test_deployment_structure() {
    start_test "Deployment Structure"
    
    if [ ! -d "$DEPLOYMENT_DIR" ]; then
        fail_test "Deployment Structure" "deployment-packages directory not found"
        return 1
    fi
    
    local package_count=$(find "$DEPLOYMENT_DIR" -name "*.tar.gz" -o -name "*.zip" | wc -l)
    
    if [ $package_count -eq 0 ]; then
        fail_test "Deployment Structure" "No deployment packages found"
        return 1
    fi
    
    print_status "Found $package_count deployment packages"
    pass_test "Deployment Structure"
}

test_package_contents() {
    local package_file="$1"
    local package_name="$2"
    
    start_test "Package Contents: $package_name"
    
    local temp_dir="$TEST_DIR/extract-$package_name"
    mkdir -p "$temp_dir"
    
    # Extract package
    if [[ "$package_file" == *.zip ]]; then
        if ! unzip -q "$package_file" -d "$temp_dir"; then
            fail_test "Package Contents: $package_name" "Failed to extract ZIP package"
            return 1
        fi
    else
        if ! tar -xzf "$package_file" -C "$temp_dir"; then
            fail_test "Package Contents: $package_name" "Failed to extract TAR.GZ package"
            return 1
        fi
    fi
    
    # Find extracted directory
    local extracted_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "task-manage-*" | head -1)
    
    if [ -z "$extracted_dir" ]; then
        fail_test "Package Contents: $package_name" "Extracted directory not found"
        return 1
    fi
    
    # Check required files and directories
    local required_items=(
        "backend"
        "frontend"
        "README.md"
        ".env.production"
    )
    
    # Platform-specific requirements
    if [[ "$package_name" == *"windows"* ]]; then
        required_items+=("start.bat" "stop.bat" "backend/task-api.exe")
    else
        required_items+=("start.sh" "stop.sh" "backend/task-api")
    fi
    
    for item in "${required_items[@]}"; do
        if [ ! -e "$extracted_dir/$item" ]; then
            fail_test "Package Contents: $package_name" "Missing required item: $item"
            return 1
        fi
    done
    
    # Check frontend files
    if [ ! -f "$extracted_dir/frontend/index.html" ]; then
        fail_test "Package Contents: $package_name" "Missing frontend index.html"
        return 1
    fi
    
    # Check backend binary is executable (Unix only)
    if [[ "$package_name" != *"windows"* ]]; then
        if [ ! -x "$extracted_dir/backend/task-api" ]; then
            fail_test "Package Contents: $package_name" "Backend binary is not executable"
            return 1
        fi
    fi
    
    pass_test "Package Contents: $package_name"
}

test_backend_startup() {
    local package_name="$1"
    local extracted_dir="$2"
    
    start_test "Backend Startup: $package_name"
    
    # Skip Windows testing on non-Windows platforms
    if [[ "$package_name" == *"windows"* ]] && [[ "$(uname -s)" != *"CYGWIN"* ]] && [[ "$(uname -s)" != *"MINGW"* ]]; then
        print_warning "Skipping Windows binary test on $(uname -s)"
        pass_test "Backend Startup: $package_name (skipped)"
        return 0
    fi
    
    # Set up test environment
    cd "$extracted_dir"
    
    # Create test environment file
    cat > ".env.test" << EOF
TASK_ENCRYPTION_KEY=test-encryption-key-32-characters-long
PORT=8082
SERVER_HOST=localhost
GIN_MODE=release
DATA_DIR=./test-data
LOG_LEVEL=info
EOF
    
    # Create test data directory
    mkdir -p test-data
    
    # Start backend
    local binary_path=""
    if [[ "$package_name" == *"windows"* ]]; then
        binary_path="backend/task-api.exe"
    else
        binary_path="backend/task-api"
    fi
    
    # Load test environment and start backend  
    set -a  # automatically export variables
    source .env.test
    set +a  # stop auto-export
    
    "$binary_path" > test-backend.log 2>&1 &
    local backend_pid=$!
    
    # Wait for backend to start
    if wait_for_port 8082 10; then
        # Test health endpoint
        if command_exists curl; then
            if curl -s "http://localhost:8082/api/health" | grep -q "success.*true"; then
                pass_test "Backend Startup: $package_name"
            else
                fail_test "Backend Startup: $package_name" "Health endpoint returned invalid response"
            fi
        else
            print_warning "curl not available, skipping health check"
            pass_test "Backend Startup: $package_name"
        fi
    else
        fail_test "Backend Startup: $package_name" "Backend failed to start within 10 seconds"
    fi
    
    # Cleanup
    kill $backend_pid 2>/dev/null || true
    wait $backend_pid 2>/dev/null || true
    
    # Clean up test files
    rm -rf test-data .env.test test-backend.log
}

test_configuration_validation() {
    local package_name="$1"
    local extracted_dir="$2"
    
    start_test "Configuration Validation: $package_name"
    
    cd "$extracted_dir"
    
    # Check .env.production structure
    if [ ! -f ".env.production" ]; then
        fail_test "Configuration Validation: $package_name" ".env.production file missing"
        return 1
    fi
    
    # Check required environment variables are defined
    local required_vars=("TASK_ENCRYPTION_KEY" "PORT" "SERVER_HOST" "DATA_DIR" "LOG_LEVEL")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" ".env.production"; then
            fail_test "Configuration Validation: $package_name" "Missing environment variable: $var"
            return 1
        fi
    done
    
    # Check if default encryption key is present (should be changed)
    if grep -q "CHANGE-THIS-TO-A-SECURE-32-CHAR-KEY" ".env.production"; then
        print_warning "Default encryption key found in $package_name - should be changed in production"
    fi
    
    pass_test "Configuration Validation: $package_name"
}

test_script_syntax() {
    local package_name="$1"
    local extracted_dir="$2"
    
    start_test "Script Syntax: $package_name"
    
    cd "$extracted_dir"
    
    if [[ "$package_name" == *"windows"* ]]; then
        # Basic batch file syntax check (limited)
        if [ -f "start.bat" ] && [ -f "stop.bat" ]; then
            print_status "Windows batch files present"
            pass_test "Script Syntax: $package_name"
        else
            fail_test "Script Syntax: $package_name" "Windows batch files missing"
        fi
    else
        # Check Unix shell scripts
        local scripts=("start.sh" "stop.sh")
        
        for script in "${scripts[@]}"; do
            if [ ! -f "$script" ]; then
                fail_test "Script Syntax: $package_name" "Missing script: $script"
                return 1
            fi
            
            if [ ! -x "$script" ]; then
                fail_test "Script Syntax: $package_name" "Script not executable: $script"
                return 1
            fi
            
            # Basic syntax check
            if ! bash -n "$script"; then
                fail_test "Script Syntax: $package_name" "Syntax error in $script"
                return 1
            fi
        done
        
        pass_test "Script Syntax: $package_name"
    fi
}

test_documentation() {
    local package_name="$1"
    local extracted_dir="$2"
    
    start_test "Documentation: $package_name"
    
    cd "$extracted_dir"
    
    if [ ! -f "README.md" ]; then
        fail_test "Documentation: $package_name" "README.md missing"
        return 1
    fi
    
    # Check for essential sections
    local required_sections=("Installation" "Configuration" "Quick Start" "Troubleshooting")
    
    for section in "${required_sections[@]}"; do
        if ! grep -qi "$section" "README.md"; then
            fail_test "Documentation: $package_name" "Missing section: $section"
            return 1
        fi
    done
    
    # Check for platform-specific content
    if [[ "$package_name" == *"windows"* ]]; then
        if ! grep -q "start.bat" "README.md"; then
            fail_test "Documentation: $package_name" "Missing Windows-specific instructions"
            return 1
        fi
    else
        if ! grep -q "start.sh" "README.md"; then
            fail_test "Documentation: $package_name" "Missing Unix-specific instructions"
            return 1
        fi
    fi
    
    pass_test "Documentation: $package_name"
}

# Main testing functions
test_all_packages() {
    print_header "Testing All Deployment Packages"
    
    cleanup_processes
    
    # Clean up any previous test directory
    if [ -d "$TEST_DIR" ]; then
        rm -rf "$TEST_DIR"
    fi
    mkdir -p "$TEST_DIR"
    
    # Find all packages
    local packages=($(find "$DEPLOYMENT_DIR" -name "*.tar.gz" -o -name "*.zip" 2>/dev/null | sort))
    
    if [ ${#packages[@]} -eq 0 ]; then
        print_error "No deployment packages found in $DEPLOYMENT_DIR"
        return 1
    fi
    
    print_status "Found ${#packages[@]} packages to test"
    
    for package_file in "${packages[@]}"; do
        local package_name=$(basename "$package_file" | sed 's/\.(tar\.gz|zip)$//')
        local platform=$(echo "$package_name" | sed 's/task-manage-[0-9.-]*-//')
        
        print_header "Testing Package: $package_name"
        
        # Test package structure
        test_package_contents "$package_file" "$platform"
        
        # Extract for detailed testing
        local temp_dir="$TEST_DIR/extract-$platform"
        local extracted_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "task-manage-*" 2>/dev/null | head -1)
        
        if [ -n "$extracted_dir" ]; then
            test_configuration_validation "$platform" "$extracted_dir"
            test_script_syntax "$platform" "$extracted_dir"
            test_documentation "$platform" "$extracted_dir"
            
            # Test backend startup (may skip Windows on non-Windows hosts)
            test_backend_startup "$platform" "$extracted_dir"
        fi
        
        # Cleanup extracted files
        rm -rf "$temp_dir"
    done
    
    cleanup_processes
}

# Test summary and reporting
generate_test_report() {
    print_header "Validation Test Report"
    
    echo -e "\n📊 ${BLUE}Test Summary${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n🎉 ${GREEN}All tests passed successfully!${NC}"
    else
        echo -e "\n⚠️ ${YELLOW}Some tests failed. Details below:${NC}"
        
        local i=1
        for test_name in $TEST_RESULTS_NAMES; do
            local result=$(echo "$TEST_RESULTS_STATUS" | cut -d' ' -f$i)
            if [[ "$result" == FAIL:* ]]; then
                echo -e "  ${RED}✗${NC} $test_name: ${result#FAIL: }"
            fi
            i=$((i + 1))
        done
    fi
    
    # Generate detailed report file
    local report_file="$TEST_DIR/validation-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Deployment Validation Report

**Generated**: $(date)
**Script**: validate-deployment.sh
**Total Tests**: $TOTAL_TESTS
**Passed**: $PASSED_TESTS
**Failed**: $FAILED_TESTS

## Test Results

EOF
    
    local i=1
    for test_name in $TEST_RESULTS_NAMES; do
        local result=$(echo "$TEST_RESULTS_STATUS" | cut -d' ' -f$i)
        if [[ "$result" == "PASS" ]]; then
            echo "- ✅ **$test_name**: PASSED" >> "$report_file"
        else
            echo "- ❌ **$test_name**: ${result#FAIL: }" >> "$report_file"
        fi
        i=$((i + 1))
    done
    
    cat >> "$report_file" << EOF

## Environment Information

- **Host OS**: $(uname -s)
- **Architecture**: $(uname -m)
- **Date**: $(date)
- **Test Directory**: $TEST_DIR
- **Deployment Directory**: $DEPLOYMENT_DIR

## Available Tools

EOF
    
    local tools=("node" "yarn" "go" "python3" "curl" "zip" "tar")
    for tool in "${tools[@]}"; do
        if command_exists "$tool"; then
            echo "- ✅ $tool: $(which $tool)" >> "$report_file"
        else
            echo "- ❌ $tool: Not available" >> "$report_file"
        fi
    done
    
    print_status "Detailed report saved to: $report_file"
}

# Main function
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Task Management Application                               ║"
    echo "║                    Deployment Validation Script                             ║"
    echo "║                                                                              ║"
    echo "║  Tests deployment packages to ensure they work correctly                    ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Check basic requirements
    print_status "Validation environment:"
    print_status "  Host OS: $(uname -s)"
    print_status "  Architecture: $(uname -m)"
    print_status "  Test directory: $TEST_DIR"
    
    # Run tests
    test_deployment_structure
    
    if [ $FAILED_TESTS -eq 0 ]; then
        test_all_packages
    else
        print_error "Skipping package tests due to structure validation failure"
    fi
    
    # Generate report
    generate_test_report
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🚀 All validations passed successfully!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some validations failed. Check the report above.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"