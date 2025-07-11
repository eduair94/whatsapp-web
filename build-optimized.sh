#!/bin/bash

# Memory-optimized build script
# This script builds the project with aggressive memory management

set -e  # Exit on any error

echo "🚀 Starting memory-optimized build process..."

# Clean up before starting
echo "🧹 Cleaning up previous builds..."
rm -rf .nuxt .output node_modules/.cache .nitro

# Build with maximum memory optimization
echo "📦 Building with maximum memory optimization..."
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=1024"
export NUXT_TELEMETRY_DISABLED=1

# Run build with npm
echo "🔧 Running build with npm..."
npm run build

# Check if build was successful
if [ ! -d ".output" ]; then
    echo "❌ Build failed - .output directory not found"
    exit 1
fi

echo "✅ Build completed successfully"
echo "📊 Build output size:"
du -sh .output 2>/dev/null || echo "Output directory created"

# Clean up build artifacts to free memory
echo "🧹 Cleaning up build artifacts..."
rm -rf .nuxt node_modules/.cache .nitro

echo "🎉 Memory-optimized build completed!"
