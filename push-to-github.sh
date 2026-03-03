#!/bin/bash

# ShibaLab Mining Platform - GitHub Push Script
# =============================================
# Email: zakirullah1579@gmail.com
# 
# STEPS TO PUSH TO GITHUB:
# ========================

echo "🐕 ShibaLab Mining Platform - GitHub Push"
echo "=========================================="
echo ""

# Step 1: Create GitHub Repository
echo "STEP 1: Create GitHub Repository"
echo "--------------------------------"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: shibalab"
echo "3. Description: SHIB Mining Platform - 140% Returns"
echo "4. Select: Public"
echo "5. DO NOT initialize with README (we have one)"
echo "6. Click: Create repository"
echo ""
read -p "Press Enter after creating repository..."

# Step 2: Add Remote
echo ""
echo "STEP 2: Adding GitHub Remote"
echo "---------------------------"
git remote add origin https://github.com/zakirullah1579/shibalab.git 2>/dev/null || git remote set-url origin https://github.com/zakirullah1579/shibalab.git
echo "Remote added: https://github.com/zakirullah1579/shibalab.git"
echo ""

# Step 3: Push to GitHub
echo "STEP 3: Pushing to GitHub"
echo "-------------------------"
echo "Enter your GitHub Personal Access Token (PAT):"
echo "(Create at: https://github.com/settings/tokens)"
echo ""

# Push
git push -u origin main

echo ""
echo "✅ Done! Check your repository at:"
echo "https://github.com/zakirullah1579/shibalab"
