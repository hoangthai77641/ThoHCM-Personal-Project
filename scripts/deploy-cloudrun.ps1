# ThoHCM Cloud Run Deployment Script
param(
    [string]$ProjectId = "thohcm-application-475603",
    [string]$ServiceName = "thohcm-backend", 
    [string]$Region = "asia-southeast1"
)

Write-Host "🚀 Deploying ThoHCM Backend to Cloud Run..." -ForegroundColor Green

# Set project
Write-Host "📋 Setting project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "📋 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
Write-Host "🔨 Building and deploying..." -ForegroundColor Yellow
gcloud builds submit --config=cloudbuild.yaml

if ($LASTEXITCODE -eq 0) {
    # Get the service URL
    Write-Host "🌐 Getting service URL..." -ForegroundColor Yellow
    $ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    Write-Host "🔗 Backend URL: $ServiceUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update frontend API_URL to: $ServiceUrl"
    Write-Host "2. Test the backend health: $ServiceUrl/api/health"
    Write-Host "3. Configure environment variables in Cloud Run console"
    Write-Host ""
    Write-Host "🔧 Set environment variables:" -ForegroundColor Yellow
    Write-Host "gcloud run services update $ServiceName --region=$Region \\"
    Write-Host "  --set-env-vars MONGODB_URI='your-mongodb-atlas-uri' \\"
    Write-Host "  --set-env-vars JWT_SECRET='your-jwt-secret' \\"
    Write-Host "  --set-env-vars ALLOWED_ORIGINS='https://thohcm-frontend.web.app,https://thohcm-application.web.app'"
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}