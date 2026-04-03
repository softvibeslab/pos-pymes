#!/bin/bash

# POS PyMES Setup Script
# This script helps with common development tasks

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20+"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm 8+"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version 20+ is required. Current version: $(node -v)"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed"
}

# Setup environment
setup_env() {
    print_info "Setting up environment..."

    if [ ! -f .env ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
        print_info "Please edit .env with your configuration"
    else
        print_info ".env file already exists"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    pnpm db:generate
    pnpm db:push
    print_success "Database setup completed"
}

# Build packages
build_packages() {
    print_info "Building packages..."
    pnpm --filter @pos-pymes/shared build
    pnpm --filter @pos-pymes/db build
    print_success "Packages built"
}

# Start development
start_dev() {
    print_info "Starting development servers..."
    pnpm dev
}

# Run tests
run_tests() {
    print_info "Running tests..."
    pnpm test
}

# Show help
show_help() {
    cat << EOF
POS PyMES - Setup Script

Usage: ./scripts/setup.sh [command]

Commands:
    install     Install dependencies
    env         Setup environment files
    db          Setup database
    build       Build packages
    dev         Start development servers
    test        Run tests
    full        Run full setup (install + env + db + build)
    help        Show this help message

Examples:
    ./scripts/setup.sh full      # Full setup
    ./scripts/setup.sh dev       # Start development
    ./scripts/setup.sh db        # Setup database only

EOF
}

# Main script
main() {
    case "${1:-help}" in
        install)
            check_prerequisites
            install_deps
            ;;
        env)
            setup_env
            ;;
        db)
            setup_database
            ;;
        build)
            build_packages
            ;;
        dev)
            start_dev
            ;;
        test)
            run_tests
            ;;
        full)
            check_prerequisites
            install_deps
            setup_env
            build_packages
            setup_database
            print_success "Full setup completed!"
            print_info "Run 'pnpm dev' to start development servers"
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
