#!/bin/bash

# Quick Start Deployment Script for Veo 3 Demo
# This script guides you through the entire deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌟 Welcome to Veo 3 Demo Deployment Assistant${NC}"
echo -e "${BLUE}This script will guide you through deploying your app to Google Cloud Run${NC}"
echo ""

# Check if required tools are installed
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI (gcloud) is not installed${NC}"
    echo -e "${YELLOW}Please install it from: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}Please install it from: https://www.docker.com/products/docker-desktop/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"
echo ""

# Get project configuration
echo -e "${YELLOW}📋 Let's configure your deployment:${NC}"
echo ""

read -p "Enter your Google Cloud Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Project ID is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🌍 Select deployment region:${NC}"
echo "1) us-central1 (Iowa, USA)"
echo "2) us-east1 (South Carolina, USA)"
echo "3) europe-west1 (Belgium, Europe)"
echo "4) asia-east1 (Taiwan, Asia)"
read -p "Choose region (1-4) [default: 1]: " REGION_CHOICE

case $REGION_CHOICE in
    2) REGION="us-east1" ;;
    3) REGION="europe-west1" ;;
    4) REGION="asia-east1" ;;
    *) REGION="us-central1" ;;
esac

echo ""
echo -e "${YELLOW}🚀 Choose deployment method:${NC}"
echo "1) Direct Docker deployment (simpler, good for first-time)"
echo "2) Cloud Build deployment (more robust, better for production)"
read -p "Choose method (1-2) [default: 1]: " DEPLOY_CHOICE

echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo -e "   Project ID: ${PROJECT_ID}"
echo -e "   Region: ${REGION}"
echo -e "   Method: $([ "$DEPLOY_CHOICE" = "2" ] && echo "Cloud Build" || echo "Direct Docker")"
echo ""

read -p "Do you want to proceed with deployment? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Export environment variables
export PROJECT_ID=$PROJECT_ID
export REGION=$REGION

echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Run the appropriate deployment script
if [ "$DEPLOY_CHOICE" = "2" ]; then
    echo -e "${YELLOW}📦 Using Cloud Build deployment...${NC}"
    ./deploy-cloudbuild.sh
else
    echo -e "${YELLOW}🐳 Using Direct Docker deployment...${NC}"
    ./deploy.sh
fi

# Setup environment variables
echo ""
echo -e "${YELLOW}🔧 Now let's set up your environment variables...${NC}"
read -p "Do you want to configure environment variables now? (y/N): " SETUP_ENV

if [[ $SETUP_ENV =~ ^[Yy]$ ]]; then
    ./setup-env.sh
else
    echo -e "${YELLOW}⚠️  Remember to set up your environment variables later using:${NC}"
    echo -e "${YELLOW}   ./setup-env.sh${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo -e "   1. Visit your deployed app URL (shown above)"
echo -e "   2. Test the video generation functionality"
echo -e "   3. Set up monitoring and alerts (optional)"
echo -e "   4. Configure custom domain (optional)"
echo ""
echo -e "${YELLOW}📚 For more information, see DEPLOYMENT.md${NC}"
