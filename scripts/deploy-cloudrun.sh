#!/bin/bash

# Project configuration
PROJECT_ID="thohcm-application-475603"
SERVICE_NAME="thohcm-backend"
REGION="asia-southeast1"

echo "🚀 Deploying ThoHCM Backend to Cloud Run..."

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo "🔨 Building and deploying..."
gcloud builds submit --config=cloudbuild.yaml

# Get the service URL
echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ Deployment completed!"
echo "🔗 Backend URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend API_URL to: $SERVICE_URL"
echo "2. Test the backend health: $SERVICE_URL/api/health"
echo "3. Configure environment variables in Cloud Run console"
echo ""
echo "🔧 Set environment variables:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "  --set-env-vars MONGODB_URI='your-mongodb-atlas-uri' \\"
echo "  --set-env-vars JWT_SECRET='your-jwt-secret' \\"
echo "  --set-env-vars ALLOWED_ORIGINS='https://thohcm-frontend.web.app,https://thohcm-application.web.app'"