#!/bin/bash

# Rose Wallet - GitHub to GitLab Sync Script
# This script syncs your GitHub repository to GitLab for F-Droid deployment

set -e  # Exit on any error

echo "🌹 Rose Wallet - Syncing to GitLab for F-Droid"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="https://github.com/DonBrowny/rose-wallet.git"
GITLAB_REPO="https://gitlab.com/DonBrowny/rose-wallet.git"
MAIN_BRANCH="main"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  GitHub: $GITHUB_REPO"
echo "  GitLab: $GITLAB_REPO"
echo "  Branch: $MAIN_BRANCH"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from your project root directory"
    exit 1
fi

# Check if gitlab remote exists
if ! git remote get-url gitlab >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  GitLab remote not found. Adding it...${NC}"
    git remote add gitlab "$GITLAB_REPO"
    echo -e "${GREEN}✅ GitLab remote added${NC}"
else
    echo -e "${GREEN}✅ GitLab remote found${NC}"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Not on $MAIN_BRANCH branch. Switching...${NC}"
    git checkout "$MAIN_BRANCH"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Please commit them first.${NC}"
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Sync cancelled${NC}"
        exit 1
    fi
fi

# Fetch latest changes from GitHub
echo -e "${BLUE}🔄 Fetching latest changes from GitHub...${NC}"
git fetch origin

# Push to GitLab
echo -e "${BLUE}📤 Pushing to GitLab...${NC}"
git push gitlab "$MAIN_BRANCH"

# Push all tags to GitLab
echo -e "${BLUE}🏷️  Pushing tags to GitLab...${NC}"
git push gitlab --tags

# Verify sync
echo -e "${BLUE}🔍 Verifying sync...${NC}"
GITHUB_COMMIT=$(git rev-parse origin/$MAIN_BRANCH)
GITLAB_COMMIT=$(git rev-parse gitlab/$MAIN_BRANCH)

if [ "$GITHUB_COMMIT" = "$GITLAB_COMMIT" ]; then
    echo -e "${GREEN}✅ Sync successful!${NC}"
    echo "  GitHub commit: $GITHUB_COMMIT"
    echo "  GitLab commit: $GITLAB_COMMIT"
else
    echo -e "${RED}❌ Sync failed - commits don't match${NC}"
    echo "  GitHub commit: $GITHUB_COMMIT"
    echo "  GitLab commit: $GITLAB_COMMIT"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Rose Wallet successfully synced to GitLab!${NC}"
echo -e "${BLUE}📱 Your app is ready for F-Droid deployment${NC}"
echo ""
echo "Next steps:"
echo "1. Check your GitLab repository: https://gitlab.com/DonBrowny/rose-wallet"
echo "2. Verify all files and commits are present"
echo "3. Submit to F-Droid using the GitLab repository"
