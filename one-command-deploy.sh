#!/bin/bash

# One-command deployment script using Artifact Registry
# Fixes the "412 Precondition Failed" GCR error

set -e

echo "🚀 Veo 3 Gemini Demo - One-Command Deployment"
echo "=============================================="

# Get project configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="veo-app"
REPOSITORY="veo-app"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"

echo "📋 Using Project: ${PROJECT_ID}"

# Prompt for API key if not set
if [ -z "$GEMINI_API_KEY" ]; then
    echo ""
    echo "🔑 GEMINI_API_KEY not found in environment"
    echo "Please enter your Google Gemini API Key:"
    echo "(Get it from: https://aistudio.google.com/app/apikey)"
    echo ""
    read -s -p "GEMINI_API_KEY: " GEMINI_API_KEY
    echo ""
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "❌ Error: GEMINI_API_KEY cannot be empty"
        exit 1
    fi
fi

echo "✅ GEMINI_API_KEY is set"

# Check if repository exists, create if not
echo "🏗️  Checking Artifact Registry repository..."
if ! gcloud artifacts repositories describe ${REPOSITORY} --location=${REGION} >/dev/null 2>&1; then
    echo "📦 Creating Artifact Registry repository: ${REPOSITORY}"
    gcloud artifacts repositories create ${REPOSITORY} \
        --repository-format=docker \
        --location=${REGION} \
        --description="Veo 3 Gemini Demo App"
fi

# Configure Docker for Artifact Registry
echo "🔧 Configuring Docker authentication..."
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet

# Build the Docker image
echo "🔨 Building Docker image for amd64/linux..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest .

# Push to Artifact Registry
echo "📤 Pushing to Artifact Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY=${GEMINI_API_KEY} \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --quiet

# Get the service URL
echo "🔍 Getting service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo ""
echo "🎉 Deployment completed successfully!"
echo "=============================================="
echo "🌐 Your app is live at: ${SERVICE_URL}"
echo ""
echo "📝 Useful commands:"
echo "  View logs:    gcloud logs tail --project=${PROJECT_ID}"
echo "  Redeploy:     ./one-command-deploy.sh"
echo "  Clean up:     gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
echo ""
echo "🎯 Next: Visit your app and test the Veo 3 video generation!"
