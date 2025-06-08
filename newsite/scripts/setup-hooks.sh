#!/bin/bash
# Setup script for Git hooks
# Configures pre-commit and pre-push hooks for automated testing

echo "⚙️  Setting up Git hooks for automated testing..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"

# Check if we're in a Git repository (check current and parent directory)
if [ -d "$PROJECT_DIR/.git" ]; then
    GIT_DIR="$PROJECT_DIR/.git"
    HOOKS_PATH="$PROJECT_DIR/.husky"
elif [ -d "$(dirname "$PROJECT_DIR")/.git" ]; then
    GIT_DIR="$(dirname "$PROJECT_DIR")/.git"
    HOOKS_PATH="$(dirname "$PROJECT_DIR")/.husky"
    echo "📂 Found Git repository in parent directory"
else
    echo "❌ Error: Not in a Git repository"
    echo "Please run this script from within a Git repository"
    exit 1
fi

# Create .husky directory if it doesn't exist
mkdir -p "$HOOKS_PATH"

# Copy hook files
if [ -f "$PROJECT_DIR/.husky/pre-commit" ]; then
    cp "$PROJECT_DIR/.husky/pre-commit" "$HOOKS_PATH/pre-commit"
    echo "✓ Pre-commit hook copied"
elif [ -f "$HOOKS_PATH/pre-commit" ]; then
    echo "✓ Pre-commit hook already exists in Git directory"
else
    echo "❌ Pre-commit hook not found"
    exit 1
fi

if [ -f "$PROJECT_DIR/.husky/pre-push" ]; then
    cp "$PROJECT_DIR/.husky/pre-push" "$HOOKS_PATH/pre-push"
    echo "✓ Pre-push hook copied"
elif [ -f "$HOOKS_PATH/pre-push" ]; then
    echo "✓ Pre-push hook already exists in Git directory"
else
    echo "❌ Pre-push hook not found"
    exit 1
fi

# Make hooks executable
chmod +x "$HOOKS_PATH/pre-commit"
chmod +x "$HOOKS_PATH/pre-push"

# Configure Git to use the hooks directory (relative to git root)
if [ "$HOOKS_PATH" = "$PROJECT_DIR/.husky" ]; then
    git config core.hooksPath newsite/.husky
else
    git config core.hooksPath .husky
fi

echo "✅ Git hooks configured successfully!"
echo ""
echo "🔧 Configured hooks:"
echo "   • pre-commit: Runs unit tests, linting, and build check"
echo "   • pre-push: Runs comprehensive test suite and coverage check"
echo ""
echo "💡 To bypass hooks temporarily:"
echo "   git commit --no-verify"
echo "   git push --no-verify"
echo ""
echo "🧪 To test the pre-commit hook:"
echo "   .husky/pre-commit"
echo ""
echo "🚀 Your development workflow now includes automated testing!"