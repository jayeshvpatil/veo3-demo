#!/bin/bash

# Updated deployment script using Artifact Registry instead of GCR
# This fixes the "412 Precondition Failed" error from GCR

set -e

echo "🚀 Starting deployment to Google Cloud Run with Artifact Registry..."

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="veo-app"
REPOSITORY="veo-app"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"

echo "📋 Configuration:"
echo "  Project ID: ${PROJECT_ID}"
echo "  Region: ${REGION}"
echo "  Service Name: ${SERVICE_NAME}"
echo "  Repository: ${REPOSITORY}"
echo "  Image: ${IMAGE_NAME}"

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable is not set."
    echo "Please set it with: export GEMINI_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ GEMINI_API_KEY is set"

# Build the Docker image
echo "🔨 Building Docker image for amd64/linux..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest .

# Push to Artifact Registry
echo "📤 Pushing image to Artifact Registry..."
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
    --timeout 300

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo "🎉 Deployment completed successfully!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo ""
echo "📝 Next steps:"
echo "  1. Visit ${SERVICE_URL} to test your application"
echo "  2. Monitor logs: gcloud logs tail --project=${PROJECT_ID}"
echo "  3. View in console: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
