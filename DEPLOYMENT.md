# 🚀 Cloud Run Deployment Guide

This guide will help you deploy the Veo 3 Demo app to Google Cloud Run.

> **📁 Note**: All deployment files are now organized in the `/deploy` folder for better organization.
> 
> **📚 Complete Guide**: For comprehensive deployment documentation, see [`deploy/README.md`](./deploy/README.md)

## 📋 Prerequisites

1. **Google Cloud Platform Account**: You need a GCP account with billing enabled
2. **Google Cloud CLI**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
4. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/)

## 🛠️ Setup

1. **Clone and navigate to the project**:
   ```bash
   cd veo-3-gemini-api-quickstart
   ```

2. **Set your GCP Project ID**:
   ```bash
   export PROJECT_ID=your-actual-project-id
   ```

3. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project $PROJECT_ID
   ```

## 🚀 Deployment Options

### Option 1: One-Command Deployment (Recommended)

Use the comprehensive deployment script that handles everything:

```bash
./deploy/deploy.sh
```

This script will:
- ✅ Check prerequisites (gcloud, Docker)
- ✅ Guide you through configuration
- ✅ Set up Google Cloud project and APIs
- ✅ Create Artifact Registry repository
- ✅ Build and push Docker image
- ✅ Deploy to Cloud Run
- ✅ Configure environment variables

### Option 2: Cloud Build Deployment (For production environments)

Use Google Cloud Build for more robust CI/CD:

```bash
export PROJECT_ID=your-project-id
./deploy/scripts/deploy-cloudbuild.sh
```

This script will:
- ✅ Use Cloud Build for container building
- ✅ Better build caching and performance
- ✅ Automatic rollbacks on failure
- ✅ Build logs and monitoring

## 🔧 Environment Variables Setup

After deployment, set up your environment variables:

```bash
./deploy/scripts/setup-env.sh
```

You'll be prompted to enter:
- **Gemini API Key** (required)
- **Additional environment variables** (optional)

## 📁 Deployment Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Container definition for the Next.js app |
| `cloudbuild.yaml` | Cloud Build configuration |
| `deploy.sh` | Direct deployment script |
| `deploy-cloudbuild.sh` | Cloud Build deployment script |
| `setup-env.sh` | Environment variables configuration |
| `.dockerignore` | Files to exclude from Docker build |

## 🔧 Manual Configuration

If you prefer manual setup, here are the key commands:

### 1. Build and Push Docker Image
```bash
# Set variables
export PROJECT_ID=your-project-id
export IMAGE_NAME=gcr.io/$PROJECT_ID/veo3-demo

# Build image
docker build -t $IMAGE_NAME .

# Push to registry
docker push $IMAGE_NAME
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy veo3-demo \
  --image $IMAGE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY=your-api-key
```

### 3. Update Environment Variables
```bash
gcloud run services update veo3-demo \
  --platform managed \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=your-actual-api-key
```

## 🔒 Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **IAM**: Use least-privilege IAM roles
3. **HTTPS**: Cloud Run enforces HTTPS by default
4. **Authentication**: Consider adding authentication for production use

## 📊 Monitoring and Logs

After deployment, you can monitor your app:

```bash
# View logs
gcloud logs read --service=veo3-demo --limit=50

# Get service details
gcloud run services describe veo3-demo --region=us-central1
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Docker is running
   - Verify all dependencies in package.json
   - Ensure sufficient disk space

2. **Deployment Failures**:
   - Check GCP APIs are enabled
   - Verify project permissions
   - Check resource quotas

3. **Runtime Errors**:
   - Check environment variables are set
   - Review Cloud Run logs
   - Verify API keys are valid

### Debug Commands:
```bash
# Check service status
gcloud run services list

# View detailed logs
gcloud logs tail --service=veo3-demo

# Check build history
gcloud builds list
```

## 💰 Cost Optimization

- **CPU Allocation**: Cloud Run charges for CPU usage
- **Min Instances**: Set to 0 for cost savings
- **Memory**: Use 1Gi for this app (adjust based on usage)
- **Request Timeout**: Default 300s should be sufficient

## 🔄 CI/CD Integration

For continuous deployment, you can integrate with GitHub Actions:

1. Store GCP service account key as GitHub secret
2. Use the `cloudbuild.yaml` configuration
3. Trigger builds on push to main branch

## 📞 Support

If you encounter issues:

1. Check the [Cloud Run documentation](https://cloud.google.com/run/docs)
2. Review [troubleshooting guide](https://cloud.google.com/run/docs/troubleshooting)
3. Check [GCP Status Page](https://status.cloud.google.com/)

---

**🎉 Your Veo 3 Demo app should now be running on Cloud Run!**

The deployment will provide you with a URL like: `https://veo3-demo-xxxxxx-uc.a.run.app`
