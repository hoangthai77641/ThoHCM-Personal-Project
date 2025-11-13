#!/bin/bash

# Quick setup script for 1000+ users infrastructure
# Run this after setting up Redis and MongoDB

echo "🚀 ThoHCM - Setup for 1000+ Concurrent Users"
echo "=============================================="

# Variables
PROJECT_ID="thohcm-application-475603"
REGION="asia-southeast1"
SERVICE_NAME="thohcm-backend"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first."
    exit 1
fi

# Set project
echo "📌 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Create Redis instance
echo ""
echo "📦 Creating Redis instance..."
read -p "Create Redis instance? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gcloud redis instances create thohcm-redis \
        --size=5 \
        --region=$REGION \
        --tier=standard \
        --redis-version=redis_7_0 \
        --display-name="ThoHCM Redis Cache"
    
    echo "✅ Redis instance created"
    
    # Get Redis IP
    REDIS_HOST=$(gcloud redis instances describe thohcm-redis \
        --region=$REGION \
        --format="value(host)")
    echo "Redis Host: $REDIS_HOST"
fi

# Create VPC Connector
echo ""
echo "🌐 Creating VPC Connector..."
read -p "Create VPC Connector? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gcloud compute networks vpc-access connectors create thohcm-connector \
        --region=$REGION \
        --range=10.8.0.0/28 \
        --network=default
    
    echo "✅ VPC Connector created"
fi

# Build and Deploy
echo ""
echo "🏗️  Building and deploying backend..."
read -p "Deploy now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Build
    gcloud builds submit --config=config/cloudbuild.yaml
    
    # Update service with VPC connector
    echo "🔗 Connecting to VPC..."
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --vpc-connector=thohcm-connector \
        --vpc-egress=private-ranges-only
    
    echo "✅ Deployment complete!"
fi

# Summary
echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "📝 Next steps:"
echo "1. Update environment variables in Cloud Run console"
echo "2. Set REDIS_HOST=$REDIS_HOST"
echo "3. Verify deployment: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo "4. Test endpoint: curl https://\$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')/api/health"
echo ""
echo "📊 Monitoring:"
echo "- Cloud Run: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
echo "- Redis: https://console.cloud.google.com/memorystore/redis/locations/$REGION/instances/thohcm-redis"
echo ""
echo "💰 Estimated monthly cost: \$760-1,395"
echo ""
