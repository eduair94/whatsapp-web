#!/bin/bash

# Zero-downtime deployment script for Nuxt.js app
# This script builds the app in a temporary directory and then atomically switches it

echo "🚀 Starting zero-downtime deployment..."

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

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it with: npm install -g pm2"
    exit 1
fi

# Create backup of current build if it exists
if [ -d ".output" ]; then
    print_status "Backing up current build..."
    if [ -d ".output-backup" ]; then
        rm -rf .output-backup
    fi
    cp -r .output .output-backup
    print_success "Current build backed up to .output-backup"
else
    print_warning "No existing build found to backup"
fi

# Clean up any previous temporary build
if [ -d ".output-temp" ]; then
    print_status "Cleaning up previous temporary build..."
    rm -rf .output-temp
fi

# Build in temporary directory
print_status "Building application in temporary directory..."
export NUXT_OUTPUT_DIR=.output-temp

if npm run build-temp; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Keeping current version running."
    
    # Clean up failed build
    if [ -d ".output-temp" ]; then
        rm -rf .output-temp
    fi
    
    exit 1
fi

# Verify the build was created
if [ ! -d ".output-temp" ]; then
    print_error "Build directory .output-temp was not created!"
    exit 1
fi

if [ ! -f ".output-temp/server/index.mjs" ]; then
    print_error "Build appears incomplete - server file not found!"
    rm -rf .output-temp
    exit 1
fi

print_success "Build verification passed!"

# Atomic switch: move temp build to production
print_status "Switching to new build..."

# Remove old build and replace with new one atomically
if [ -d ".output" ]; then
    rm -rf .output
fi

mv .output-temp .output

if [ $? -eq 0 ]; then
    print_success "Build switched successfully!"
else
    print_error "Failed to switch builds!"
    
    # Try to restore from backup
    if [ -d ".output-backup" ]; then
        print_status "Attempting to restore from backup..."
        mv .output-backup .output
        print_warning "Restored from backup"
    fi
    
    exit 1
fi

# Restart the application with PM2
print_status "Restarting application with PM2..."

if pm2 restart WP_Checker; then
    print_success "Application restarted successfully with PM2!"
else
    print_error "Failed to restart application with PM2!"
    
    # Check if the process exists
    if pm2 list | grep -q "WP_Checker"; then
        print_status "Process exists, trying to reload instead..."
        if pm2 reload WP_Checker; then
            print_success "Application reloaded successfully!"
        else
            print_error "Failed to reload application!"
            exit 1
        fi
    else
        print_error "PM2 process 'WP_Checker' not found!"
        print_status "Available PM2 processes:"
        pm2 list
        exit 1
    fi
fi

# Clean up backup after successful deployment
if [ -d ".output-backup" ]; then
    print_status "Cleaning up backup..."
    rm -rf .output-backup
    print_success "Backup cleaned up"
fi

# Show final status
print_success "🎉 Zero-downtime deployment completed successfully!"
print_status "Application is now running the new build"

# Optional: Show PM2 status
print_status "Current PM2 status:"
pm2 show WP_Checker
