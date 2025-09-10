#!/bin/bash

# Cloud Build Deployment Script for Veo 3 Demo
# This script uses Google Cloud Build for a more robust deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PROJECT_ID="${PROJECT_ID}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-veo3-demo}"
REPO_NAME="${REPO_NAME:-veo-app}"

echo -e "${GREEN}🚀 Starting Cloud Build deployment of Veo 3 Demo${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ gcloud CLI is required but not installed${NC}"
        exit 1
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ PROJECT_ID environment variable is required${NC}"
        echo -e "${YELLOW}Set it with: export PROJECT_ID=your-project-id${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to setup Google Cloud
setup_gcloud() {
    echo -e "${YELLOW}📁 Setting up Google Cloud...${NC}"
    
    # Set the project
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    
    echo -e "${GREEN}✅ Google Cloud setup complete${NC}"
}

# Function to run Cloud Build
run_cloud_build() {
    echo -e "${YELLOW}🔨 Submitting build to Cloud Build...${NC}"
    
    # Submit build with substitutions
    gcloud builds submit \
        --config ./deploy/config/cloudbuild.yaml \
        --substitutions=_REGION=$REGION,_SERVICE_NAME=$SERVICE_NAME,_REPO_NAME=$REPO_NAME \
        .
    
    echo -e "${GREEN}✅ Cloud Build completed successfully${NC}"
}

# Function to get service URL and show results
show_results() {
    echo -e "${YELLOW}📋 Getting service information...${NC}"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Service Details:${NC}"
    echo -e "   Service Name: ${SERVICE_NAME}"
    echo -e "   Region:       ${REGION}"
    echo -e "   Service URL:  ${SERVICE_URL}"
    echo ""
    echo -e "${BLUE}📖 Next Steps:${NC}"
    echo -e "   1. Visit your app: ${SERVICE_URL}"
    echo -e "   2. Set up environment variables if needed"
    echo -e "   3. Monitor logs: gcloud run logs tail $SERVICE_NAME --region $REGION"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "   Project ID:   ${PROJECT_ID}"
    echo -e "   Region:       ${REGION}"
    echo -e "   Service Name: ${SERVICE_NAME}"
    echo -e "   Repository:   ${REPO_NAME}"
    echo ""
    
    check_prerequisites
    setup_gcloud
    run_cloud_build
    show_results
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0"
        echo ""
        echo "Required environment variables:"
        echo "  PROJECT_ID     Google Cloud Project ID"
        echo ""
        echo "Optional environment variables:"
        echo "  REGION         Deployment region (default: us-central1)"
        echo "  SERVICE_NAME   Cloud Run service name (default: veo3-demo)"
        echo "  REPO_NAME      Artifact Registry repository name (default: veo-app)"
        echo ""
        echo "Example:"
        echo "  PROJECT_ID=my-project REGION=us-east1 $0"
        exit 0
        ;;
    *)
        main
        ;;
esac
