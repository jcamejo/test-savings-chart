#!/bin/bash

# GitHub Pages Setup Script
# Run this after creating your GitHub repository

echo "🚀 GitHub Pages Setup Script"
echo "=============================="
echo ""

# Check if git remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Get GitHub username and repo name
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your repository name (default: history-charts): " REPO_NAME
REPO_NAME=${REPO_NAME:-history-charts}

# Set remote
echo ""
echo "Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "✅ Remote configured:"
git remote -v

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
echo "2. Under 'Source', select branch 'main' and folder '/ (root)'"
echo "3. Click 'Save'"
echo "4. Your site will be available at: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"
echo ""

