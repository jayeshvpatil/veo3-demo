#!/bin/bash

# Helper script to set up environment variables for deployment
# Run this before deploying: source ./setup-env.sh

echo "🔧 Setting up environment variables for Veo 3 Gemini Demo deployment..."

# Check if GEMINI_API_KEY is already set
if [ -z "$GEMINI_API_KEY" ]; then
    echo ""
    echo "📝 Please enter your Google Gemini API Key:"
    echo "   (You can get this from: https://aistudio.google.com/app/apikey)"
    echo ""
    read -s -p "GEMINI_API_KEY: " GEMINI_API_KEY
    echo ""
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "❌ Error: GEMINI_API_KEY cannot be empty"
        return 1 2>/dev/null || exit 1
    fi
    
    export GEMINI_API_KEY
    echo "✅ GEMINI_API_KEY has been set"
else
    echo "✅ GEMINI_API_KEY is already set"
fi

echo ""
echo "🚀 Environment is ready for deployment!"
echo ""
echo "Available deployment options:"
echo "  1. ./deploy-artifact-registry.sh  (Recommended - uses Artifact Registry)"
echo "  2. ./deploy.sh                    (Original script - might have GCR issues)"
echo "  3. ./quick-deploy.sh              (Quick deployment)"
echo ""
echo "Run one of the above scripts to deploy your application."
