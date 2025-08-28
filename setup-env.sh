#!/bin/bash

# Environment Variables Setup Script for Cloud Run
# This script helps you set up environment variables for the deployed service

set -e  # Exit on any error

# Configuration variables
PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-veo3-demo}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up environment variables for Cloud Run service${NC}"

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -e "${RED}❌ Please set PROJECT_ID environment variable with your GCP project ID${NC}"
    echo -e "${YELLOW}Example: export PROJECT_ID=my-project-123${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "   Project ID: ${PROJECT_ID}"
echo -e "   Region: ${REGION}"
echo -e "   Service Name: ${SERVICE_NAME}"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}🔐 Please provide the following environment variables:${NC}"
echo ""

# Prompt for Gemini API key
read -p "Enter your Gemini API Key: " GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ Gemini API Key is required${NC}"
    exit 1
fi

# Prompt for any additional environment variables
echo ""
echo -e "${YELLOW}💡 Optional: Add any additional environment variables (press Enter to skip)${NC}"
read -p "Enter additional env vars (format: KEY1=value1,KEY2=value2): " ADDITIONAL_VARS

# Build the environment variables string
ENV_VARS="GEMINI_API_KEY=$GEMINI_API_KEY,NODE_ENV=production"

if [ ! -z "$ADDITIONAL_VARS" ]; then
    ENV_VARS="$ENV_VARS,$ADDITIONAL_VARS"
fi

echo ""
echo -e "${YELLOW}🚀 Updating Cloud Run service with environment variables...${NC}"

# Update the service with environment variables
gcloud run services update $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --set-env-vars "$ENV_VARS"

echo ""
echo -e "${GREEN}✅ Environment variables updated successfully!${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}🌐 Your app is available at: ${SERVICE_URL}${NC}"
echo ""
