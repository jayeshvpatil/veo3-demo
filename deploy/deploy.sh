#!/bin/bash

# Veo 3 Demo - One-Command Cloud Run Deployment
# This script handles the complete deployment process for Google Cloud Run

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PROJECT_ID="your-gcp-project-id"
DEFAULT_REGION="us-central1"
DEFAULT_SERVICE_NAME="veo3-demo"
DEFAULT_REPO_NAME="veo-app"

echo -e "${GREEN}🌟 Veo 3 Demo - Cloud Run Deployment${NC}"
echo -e "${BLUE}This script will deploy your app to Google Cloud Run with all best practices${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "${PURPLE}==== $1 ====${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking Prerequisites"
    
    # Check gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ Google Cloud CLI (gcloud) is not installed${NC}"
        echo -e "${YELLOW}Install from: https://cloud.google.com/sdk/docs/install${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        echo -e "${YELLOW}Install from: https://www.docker.com/products/docker-desktop/${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites are installed${NC}"
}

# Function to get user configuration
get_configuration() {
    print_step "Configuration Setup"
    
    # Get Project ID
    if [ -z "$PROJECT_ID" ]; then
        read -p "Enter your Google Cloud Project ID [$DEFAULT_PROJECT_ID]: " PROJECT_ID
        PROJECT_ID=${PROJECT_ID:-$DEFAULT_PROJECT_ID}
    fi
    
    if [ "$PROJECT_ID" = "$DEFAULT_PROJECT_ID" ]; then
        echo -e "${RED}❌ Please provide a valid Google Cloud Project ID${NC}"
        exit 1
    fi
    
    # Get Region
    if [ -z "$REGION" ]; then
        echo ""
        echo -e "${YELLOW}🌍 Select deployment region:${NC}"
        echo "1) us-central1 (Iowa, USA) - Default"
        echo "2) us-east1 (South Carolina, USA)"
        echo "3) europe-west1 (Belgium, Europe)"
        echo "4) asia-east1 (Taiwan, Asia)"
        read -p "Choose region (1-4) [1]: " REGION_CHOICE
        
        case $REGION_CHOICE in
            2) REGION="us-east1" ;;
            3) REGION="europe-west1" ;;
            4) REGION="asia-east1" ;;
            *) REGION="us-central1" ;;
        esac
    fi
    
    # Get Service Name
    if [ -z "$SERVICE_NAME" ]; then
        read -p "Enter Cloud Run service name [$DEFAULT_SERVICE_NAME]: " SERVICE_NAME
        SERVICE_NAME=${SERVICE_NAME:-$DEFAULT_SERVICE_NAME}
    fi
    
    # Get Repository Name
    if [ -z "$REPO_NAME" ]; then
        read -p "Enter Artifact Registry repository name [$DEFAULT_REPO_NAME]: " REPO_NAME
        REPO_NAME=${REPO_NAME:-$DEFAULT_REPO_NAME}
    fi
    
    # Set derived variables
    REPOSITORY_URL="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME"
    IMAGE_NAME="$REPOSITORY_URL/$SERVICE_NAME"
    
    echo ""
    echo -e "${BLUE}📋 Deployment Configuration:${NC}"
    echo -e "   Project ID:      ${PROJECT_ID}"
    echo -e "   Region:          ${REGION}"
    echo -e "   Service Name:    ${SERVICE_NAME}"
    echo -e "   Repository:      ${REPO_NAME}"
    echo -e "   Image URL:       ${IMAGE_NAME}:latest"
    echo ""
}

# Function to setup Google Cloud
setup_gcloud() {
    print_step "Google Cloud Setup"
    
    # Authenticate if needed
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        echo -e "${YELLOW}🔐 Authentication required. Opening browser...${NC}"
        gcloud auth login
    fi
    
    # Set project
    echo -e "${YELLOW}📁 Setting project: $PROJECT_ID${NC}"
    gcloud config set project $PROJECT_ID
    
    # Enable APIs
    echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    
    echo -e "${GREEN}✅ Google Cloud setup complete${NC}"
}

# Function to setup Artifact Registry
setup_artifact_registry() {
    print_step "Artifact Registry Setup"
    
    # Check if repository exists
    if gcloud artifacts repositories describe $REPO_NAME --location=$REGION --quiet 2>/dev/null; then
        echo -e "${GREEN}✅ Artifact Registry repository '$REPO_NAME' already exists${NC}"
    else
        echo -e "${YELLOW}📦 Creating Artifact Registry repository...${NC}"
        gcloud artifacts repositories create $REPO_NAME \
            --repository-format=docker \
            --location=$REGION \
            --description="Veo 3 Demo container repository"
        echo -e "${GREEN}✅ Artifact Registry repository created${NC}"
    fi
    
    # Configure Docker authentication
    echo -e "${YELLOW}🔐 Configuring Docker authentication...${NC}"
    gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
    
    echo -e "${GREEN}✅ Artifact Registry setup complete${NC}"
}

# Function to build and push Docker image
build_and_push() {
    print_step "Building and Pushing Container Image"
    
    echo -e "${YELLOW}🔨 Building Docker image...${NC}"
    docker build --platform linux/amd64 -t $IMAGE_NAME:latest .
    
    echo -e "${YELLOW}📤 Pushing image to Artifact Registry...${NC}"
    docker push $IMAGE_NAME:latest
    
    echo -e "${GREEN}✅ Image built and pushed successfully${NC}"
}

# Function to deploy to Cloud Run
deploy_to_cloudrun() {
    print_step "Deploying to Cloud Run"
    
    echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory 2Gi \
        --cpu 2 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 900 \
        --set-env-vars NODE_ENV=production
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your app is live at: ${SERVICE_URL}${NC}"
    echo ""
}

# Function to setup environment variables
setup_environment() {
    print_step "Environment Variables Setup"
    
    read -p "Do you want to configure environment variables now? (y/N): " SETUP_ENV
    
    if [[ $SETUP_ENV =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}🔧 Setting up environment variables...${NC}"
        
        # Prompt for API keys
        read -s -p "Enter your Gemini API Key: " GEMINI_API_KEY
        echo ""
        
        if [ ! -z "$GEMINI_API_KEY" ]; then
            echo -e "${YELLOW}📝 Updating Cloud Run service with environment variables...${NC}"
            gcloud run services update $SERVICE_NAME \
                --region $REGION \
                --set-env-vars GEMINI_API_KEY="$GEMINI_API_KEY"
            echo -e "${GREEN}✅ Environment variables configured${NC}"
        else
            echo -e "${YELLOW}⚠️  No API key provided. You can set it later using:${NC}"
            echo -e "${YELLOW}   gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars GEMINI_API_KEY=your_key${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Remember to set up your environment variables:${NC}"
        echo -e "${YELLOW}   gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars GEMINI_API_KEY=your_key${NC}"
    fi
}

# Function to show final summary
show_summary() {
    print_step "Deployment Summary"
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Details:${NC}"
    echo -e "   Service Name:    ${SERVICE_NAME}"
    echo -e "   Region:          ${REGION}"
    echo -e "   Image:           ${IMAGE_NAME}:latest"
    echo -e "   Service URL:     ${SERVICE_URL}"
    echo ""
    echo -e "${BLUE}📖 Next Steps:${NC}"
    echo -e "   1. Visit your app: ${SERVICE_URL}"
    echo -e "   2. Test video generation functionality"
    echo -e "   3. Monitor logs: gcloud run logs tail $SERVICE_NAME --region $REGION"
    echo -e "   4. Update environment variables if needed"
    echo ""
    echo -e "${YELLOW}📚 For troubleshooting, see: ./deploy/README.md${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    get_configuration
    
    echo ""
    read -p "Do you want to proceed with deployment? (y/N): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled.${NC}"
        exit 0
    fi
    
    setup_gcloud
    setup_artifact_registry
    build_and_push
    deploy_to_cloudrun
    setup_environment
    show_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Environment variables:"
        echo "  PROJECT_ID     Google Cloud Project ID"
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
