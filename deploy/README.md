# Veo 3 Demo - Deployment Guide

This directory contains all deployment-related files and scripts for deploying the Veo 3 Demo to Google Cloud Run.

## 📁 Directory Structure

```
deploy/
├── deploy.sh                    # Main deployment script (recommended)
├── config/
│   └── cloudbuild.yaml         # Cloud Build configuration
├── scripts/
│   ├── deploy-cloudbuild.sh    # Cloud Build deployment script
│   └── setup-env.sh            # Environment variables setup
└── README.md                   # This file
```

## 🚀 Quick Start

### Option 1: One-Command Deployment (Recommended)

The easiest way to deploy is using the main deployment script:

```bash
# Make the script executable
chmod +x deploy/deploy.sh

# Run the deployment script
./deploy/deploy.sh
```

This script will:
- Check prerequisites (gcloud CLI, Docker)
- Guide you through configuration
- Set up Google Cloud project and APIs
- Create Artifact Registry repository
- Build and push Docker image
- Deploy to Cloud Run
- Configure environment variables

### Option 2: Using Environment Variables

You can pre-configure the deployment by setting environment variables:

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export SERVICE_NAME="veo3-demo"
export REPO_NAME="veo-app"

./deploy/deploy.sh
```

### Option 3: Cloud Build Deployment

For production environments, use Cloud Build:

```bash
# Set required environment variable
export PROJECT_ID="your-gcp-project-id"

# Run Cloud Build deployment
chmod +x deploy/scripts/deploy-cloudbuild.sh
./deploy/scripts/deploy-cloudbuild.sh
```

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Google Cloud CLI** installed and configured
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Initialize and authenticate
   gcloud init
   ```

2. **Docker** installed and running
   ```bash
   # macOS
   brew install docker
   
   # Or download from https://www.docker.com/products/docker-desktop/
   ```

3. **Google Cloud Project** with billing enabled
   - Create a project at https://console.cloud.google.com/
   - Enable billing for the project

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_ID` | Google Cloud Project ID | Required |
| `REGION` | Deployment region | `us-central1` |
| `SERVICE_NAME` | Cloud Run service name | `veo3-demo` |
| `REPO_NAME` | Artifact Registry repository name | `veo-app` |

### Supported Regions

- `us-central1` (Iowa, USA) - Default
- `us-east1` (South Carolina, USA)
- `europe-west1` (Belgium, Europe)
- `asia-east1` (Taiwan, Asia)

## 🔧 Environment Variables Setup

After deployment, configure your API keys:

```bash
# Using the setup script
chmod +x deploy/scripts/setup-env.sh
./deploy/scripts/setup-env.sh

# Or manually
gcloud run services update veo3-demo \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=your_api_key
```

### Required API Keys

1. **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Used for video generation (Veo 3)
   - Used for image generation (Imagen 4)
   - Used for visual generation (Gemini 2.5 Flash)

## 📊 Cloud Run Configuration

The deployment uses these Cloud Run settings:

- **Memory**: 2Gi
- **CPU**: 2
- **Port**: 3000
- **Min Instances**: 0
- **Max Instances**: 10
- **Timeout**: 900s
- **Concurrency**: 1000

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **API Not Enabled**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

3. **Docker Build Fails**
   ```bash
   # Ensure Docker is running
   docker --version
   
   # Clear Docker cache
   docker system prune -a
   ```

4. **Permission Denied**
   ```bash
   # Make scripts executable
   chmod +x deploy/deploy.sh
   chmod +x deploy/scripts/*.sh
   ```

### Checking Deployment Status

```bash
# Check service status
gcloud run services describe veo3-demo --region us-central1

# View logs
gcloud run logs tail veo3-demo --region us-central1

# Check environment variables
deploy/scripts/setup-env.sh --status
```

### Manual Deployment Steps

If the automated scripts fail, you can deploy manually:

```bash
# 1. Set up project
gcloud config set project YOUR_PROJECT_ID
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# 2. Create Artifact Registry repository
gcloud artifacts repositories create veo-app \
  --repository-format=docker \
  --location=us-central1

# 3. Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# 4. Build and push image
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/veo-app/veo3-demo:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/veo-app/veo3-demo:latest

# 5. Deploy to Cloud Run
gcloud run deploy veo3-demo \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/veo-app/veo3-demo:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars NODE_ENV=production
```

## 🔒 Security Considerations

- API keys are stored as environment variables in Cloud Run
- The service allows unauthenticated access (suitable for demos)
- For production, consider implementing authentication
- Monitor usage to prevent API quota exhaustion

## 📈 Monitoring and Scaling

```bash
# View real-time logs
gcloud run logs tail veo3-demo --region us-central1

# Monitor metrics
gcloud run services describe veo3-demo --region us-central1

# Update scaling settings
gcloud run services update veo3-demo \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20
```

## 🧹 Cleanup

To remove all deployed resources:

```bash
# Delete Cloud Run service
gcloud run services delete veo3-demo --region us-central1

# Delete Artifact Registry repository
gcloud artifacts repositories delete veo-app --location us-central1

# Delete container images (optional)
gcloud artifacts docker images delete us-central1-docker.pkg.dev/YOUR_PROJECT_ID/veo-app/veo3-demo --delete-tags
```

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [Cloud Run logs](#checking-deployment-status)
3. Open an issue in the project repository
