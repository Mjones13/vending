#!/bin/bash

# Development helper script for NewSite
echo "🚀 Starting NewSite development server..."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the newsite directory."
    exit 1
fi

# Clean any corrupted build files
echo "🧹 Cleaning previous build files..."
rm -rf .next

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌟 Starting Next.js development server..."
echo "📍 Server will be available at: http://localhost:3000"
echo "🔄 Hot reload is enabled - changes will automatically update"
echo ""
npm run dev 