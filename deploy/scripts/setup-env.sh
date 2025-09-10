#!/bin/bash

# Environment Variables Setup for Veo 3 Demo
# This script helps configure environment variables for the deployed Cloud Run service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${PROJECT_ID}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-veo3-demo}"

echo -e "${GREEN}🔧 Environment Variables Setup for Veo 3 Demo${NC}"
echo ""

# Function to validate inputs
validate_inputs() {
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ PROJECT_ID environment variable is required${NC}"
        echo -e "${YELLOW}Set it with: export PROJECT_ID=your-project-id${NC}"
        exit 1
    fi
    
    if [ -z "$SERVICE_NAME" ]; then
        echo -e "${RED}❌ SERVICE_NAME environment variable is required${NC}"
        exit 1
    fi
}

# Function to check if service exists
check_service() {
    echo -e "${YELLOW}🔍 Checking if Cloud Run service exists...${NC}"
    
    if ! gcloud run services describe $SERVICE_NAME --region $REGION --quiet 2>/dev/null; then
        echo -e "${RED}❌ Cloud Run service '$SERVICE_NAME' not found in region '$REGION'${NC}"
        echo -e "${YELLOW}Please deploy the service first or check the service name and region${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Service found${NC}"
}

# Function to get API keys
get_api_keys() {
    echo -e "${BLUE}📋 Environment Variables Configuration${NC}"
    echo ""
    echo "This script will help you configure the required API keys for your Veo 3 Demo app."
    echo ""
    
    # Gemini API Key
    echo -e "${YELLOW}🔑 Gemini API Key${NC}"
    echo "This is required for video generation and image generation."
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -s -p "Enter your Gemini API Key: " GEMINI_API_KEY
    echo ""
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}❌ Gemini API Key is required${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ API key captured${NC}"
    echo ""
}

# Function to update Cloud Run service
update_service() {
    echo -e "${YELLOW}📝 Updating Cloud Run service with environment variables...${NC}"
    
    # Set environment variables
    gcloud run services update $SERVICE_NAME \
        --region $REGION \
        --set-env-vars GEMINI_API_KEY="$GEMINI_API_KEY",NODE_ENV=production
    
    echo -e "${GREEN}✅ Environment variables updated successfully${NC}"
}

# Function to verify deployment
verify_deployment() {
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    
    echo -e "${GREEN}✅ Verification complete${NC}"
    echo ""
    echo -e "${BLUE}📋 Service Information:${NC}"
    echo -e "   Service Name: ${SERVICE_NAME}"
    echo -e "   Region:       ${REGION}"
    echo -e "   Service URL:  ${SERVICE_URL}"
    echo ""
    echo -e "${GREEN}🎉 Your Veo 3 Demo is ready!${NC}"
    echo -e "${BLUE}Visit: ${SERVICE_URL}${NC}"
}

# Function to show environment variable status
show_env_status() {
    echo -e "${YELLOW}📋 Current environment variables:${NC}"
    
    # Get current environment variables (safely)
    ENV_VARS=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(spec.template.spec.template.spec.containers[0].env[].name)' 2>/dev/null || echo "")
    
    if [ -z "$ENV_VARS" ]; then
        echo -e "${YELLOW}   No environment variables currently set${NC}"
    else
        echo -e "${GREEN}   Environment variables set:${NC}"
        echo "$ENV_VARS" | while read var; do
            if [ ! -z "$var" ]; then
                echo -e "   - $var"
            fi
        done
    fi
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "   Project ID:   ${PROJECT_ID}"
    echo -e "   Region:       ${REGION}"
    echo -e "   Service Name: ${SERVICE_NAME}"
    echo ""
    
    validate_inputs
    check_service
    show_env_status
    
    read -p "Do you want to update environment variables? (y/N): " UPDATE_ENV
    
    if [[ $UPDATE_ENV =~ ^[Yy]$ ]]; then
        get_api_keys
        update_service
        verify_deployment
    else
        echo -e "${YELLOW}Environment variables not updated${NC}"
        echo -e "${YELLOW}You can run this script again later to configure them${NC}"
    fi
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
        echo "  REGION         Cloud Run region (default: us-central1)"
        echo "  SERVICE_NAME   Cloud Run service name (default: veo3-demo)"
        echo ""
        echo "Example:"
        echo "  PROJECT_ID=my-project $0"
        exit 0
        ;;
    --status)
        validate_inputs
        check_service
        show_env_status
        exit 0
        ;;
    *)
        main
        ;;
esac
