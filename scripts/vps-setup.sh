#!/bin/bash

# VPS Initial Setup Script for Investment V2
# This script automates the initial setup of your VPS for deployment

set -e  # Exit on error

echo "🚀 Investment V2 - VPS Setup Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

echo -e "${YELLOW}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

echo -e "${YELLOW}Step 4: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install git -y
    echo -e "${GREEN}✓ Git installed${NC}"
else
    echo -e "${GREEN}✓ Git already installed${NC}"
fi

echo -e "${YELLOW}Step 5: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx installed and started${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

echo -e "${YELLOW}Step 6: Installing Certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✓ Certbot installed${NC}"
else
    echo -e "${GREEN}✓ Certbot already installed${NC}"
fi

echo -e "${YELLOW}Step 7: Setting up firewall...${NC}"
if ! command -v ufw &> /dev/null; then
    apt install ufw -y
fi
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
echo -e "${GREEN}✓ Firewall configured${NC}"

echo -e "${YELLOW}Step 8: Creating deployment directory...${NC}"
mkdir -p /var/www/investment-v2
echo -e "${GREEN}✓ Deployment directory created${NC}"

echo -e "${YELLOW}Step 9: Generating SSH key for GitHub Actions...${NC}"
if [ ! -f ~/.ssh/github_actions ]; then
    ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
    cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo -e "${GREEN}✓ SSH key generated${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Add this PRIVATE key to GitHub Secrets as VPS_SSH_KEY:${NC}"
    echo "----------------------------------------"
    cat ~/.ssh/github_actions
    echo "----------------------------------------"
else
    echo -e "${GREEN}✓ SSH key already exists${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ VPS Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Add the SSH private key above to GitHub Secrets as VPS_SSH_KEY"
echo "2. Add other required secrets to GitHub (see DEPLOYMENT.md)"
echo "3. Clone your repository to /var/www/investment-v2"
echo "4. Configure Nginx reverse proxy (see DEPLOYMENT.md)"
echo "5. Obtain SSL certificate with: sudo certbot --nginx -d yourdomain.com"
echo "6. Push to main branch to trigger automatic deployment"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
