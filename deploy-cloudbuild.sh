#!/bin/bash

# Cloud Build Deployment Script for Veo 3 Demo App
# This script uses Google Cloud Build to build and deploy the app

set -e  # Exit on any error

# Configuration variables
PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Cloud Build deployment of Veo 3 Demo${NC}"

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}❌ gcloud CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -e "${RED}❌ Please set PROJECT_ID environment variable with your GCP project ID${NC}"
    echo -e "${YELLOW}Example: export PROJECT_ID=my-project-123${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "   Project ID: ${PROJECT_ID}"
echo -e "   Region: ${REGION}"
echo ""

# Set the project
echo -e "${YELLOW}📁 Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Submit build to Cloud Build
echo -e "${YELLOW}🔨 Submitting build to Cloud Build...${NC}"
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe veo3-demo --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Set up your environment variables in Cloud Run console"
echo -e "   2. Configure your domain (if needed)"
echo -e "   3. Set up monitoring and logging"
echo ""
