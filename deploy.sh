#!/bin/bash

# Deployment script for WP_Checker
# This script builds the project, replaces the production output, and restarts PM2

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Step 1: Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ ! -d ".output" ]; then
    echo "❌ Build failed - .output directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Step 2: Stop PM2 process to avoid file conflicts
echo "⏹️  Stopping PM2 process WP_Checker..."
pm2 stop WP_Checker || echo "⚠️  Process WP_Checker was not running"

# Step 3: Backup current production output (optional safety measure)
if [ -d ".output_pd" ]; then
    echo "🔄 Creating backup of current production files..."
    mv .output_pd .output_pd_backup_$(date +%Y%m%d_%H%M%S) || echo "⚠️  Failed to create backup"
fi

# Step 4: Copy new build to production directory and remove old .output
echo "📁 Copying new build to production directory..."
cp -r .output .output_pd

# Verify the copy was successful
if [ ! -d ".output_pd" ]; then
    echo "❌ Failed to copy .output to .output_pd"
    # Try to restore from backup if available
    if [ -d ".output_pd_backup_$(date +%Y%m%d_%H%M%S)" ]; then
        echo "🔄 Restoring from backup..."
        mv .output_pd_backup_$(date +%Y%m%d_%H%M%S) .output_pd
    fi
    exit 1
fi

# Step 5: Remove the old .output directory
echo "🗑️  Removing old .output directory..."
rm -rf .output

echo "✅ Production files updated successfully"

# Step 6: Restart PM2 process
echo "🔄 Restarting PM2 process WP_Checker..."
pm2 restart WP_Checker

# Check if process is running
if pm2 list | grep -q "WP_Checker.*online"; then
    echo "✅ WP_Checker is running successfully"
else
    echo "❌ Failed to start WP_Checker"
    pm2 logs WP_Checker --lines 10
    exit 1
fi

# Step 7: Clean up old backups (keep only last 3)
echo "🧹 Cleaning up old backups..."
ls -dt .output_pd_backup_* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true

echo "🎉 Deployment completed successfully!"
echo "📊 Process status:"
pm2 list | grep WP_Checker || pm2 list
