# PowerShell script for Windows deployment - 1000+ users setup

Write-Host "🚀 ThoHCM - Setup for 1000+ Concurrent Users" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$PROJECT_ID = "thohcm-application-475603"
$REGION = "asia-southeast1"
$SERVICE_NAME = "thohcm-backend"
$REDIS_INSTANCE = "thohcm-redis"
$VPC_CONNECTOR = "thohcm-connector"

# Check if gcloud is installed
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📌 Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Create Redis instance
Write-Host ""
$createRedis = Read-Host "📦 Create Redis instance? (y/n)"
if ($createRedis -eq "y" -or $createRedis -eq "Y") {
    Write-Host "Creating Redis instance..." -ForegroundColor Yellow
    
    gcloud redis instances create $REDIS_INSTANCE `
        --size=5 `
        --region=$REGION `
        --tier=standard `
        --redis-version=redis_7_0 `
        --display-name="ThoHCM Redis Cache"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis instance created" -ForegroundColor Green
        
        # Get Redis IP
        $REDIS_HOST = gcloud redis instances describe $REDIS_INSTANCE `
            --region=$REGION `
            --format="value(host)"
        
        Write-Host "Redis Host: $REDIS_HOST" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Redis creation failed or already exists" -ForegroundColor Yellow
    }
}

# Create VPC Connector
Write-Host ""
$createVPC = Read-Host "🌐 Create VPC Connector? (y/n)"
if ($createVPC -eq "y" -or $createVPC -eq "Y") {
    Write-Host "Creating VPC Connector..." -ForegroundColor Yellow
    
    # Check if connector already exists and delete if failed
    $existingConnector = gcloud compute networks vpc-access connectors describe $VPC_CONNECTOR `
        --region=$REGION 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  VPC Connector already exists, checking status..." -ForegroundColor Yellow
        
        # Check if it's in ERROR state
        if ($existingConnector -match "state: ERROR") {
            Write-Host "🗑️  Deleting failed VPC Connector..." -ForegroundColor Yellow
            gcloud compute networks vpc-access connectors delete $VPC_CONNECTOR `
                --region=$REGION `
                --quiet
            
            Start-Sleep -Seconds 10
        } else {
            Write-Host "✅ VPC Connector already exists and is healthy" -ForegroundColor Green
            return
        }
    }
    
    # Create new connector
    gcloud compute networks vpc-access connectors create $VPC_CONNECTOR `
        --region=$REGION `
        --range=10.8.0.0/28 `
        --network=default
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ VPC Connector created" -ForegroundColor Green
    } else {
        Write-Host "⚠️  VPC Connector creation failed" -ForegroundColor Yellow
        Write-Host "   Trying alternative IP range..." -ForegroundColor Gray
        
        # Try different IP range
        gcloud compute networks vpc-access connectors create $VPC_CONNECTOR `
            --region=$REGION `
            --range=10.9.0.0/28 `
            --network=default
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ VPC Connector created with alternative range" -ForegroundColor Green
        } else {
            Write-Host "❌ VPC Connector creation failed" -ForegroundColor Red
            Write-Host "   You may need to create it manually in Cloud Console" -ForegroundColor Gray
            Write-Host "   https://console.cloud.google.com/networking/connectors/list?project=$PROJECT_ID" -ForegroundColor Cyan
        }
    }
}

# Install dependencies
Write-Host ""
$installDeps = Read-Host "📦 Install backend dependencies? (y/n)"
if ($installDeps -eq "y" -or $installDeps -eq "Y") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Get environment variables for deployment
Write-Host ""
Write-Host "🔑 Environment Variables Setup" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan
Write-Host ""

# Get MongoDB URI
Write-Host "📝 Enter MongoDB URI:" -ForegroundColor Yellow
Write-Host "   (e.g., mongodb+srv://user:pass@cluster.mongodb.net/thohcm)" -ForegroundColor Gray
$MONGODB_URI = Read-Host "MongoDB URI"

if ([string]::IsNullOrWhiteSpace($MONGODB_URI)) {
    Write-Host "❌ MongoDB URI is required!" -ForegroundColor Red
    exit 1
}

# Get JWT Secret
Write-Host ""
Write-Host "📝 Enter JWT Secret (minimum 32 characters):" -ForegroundColor Yellow
Write-Host "   (Generate with: openssl rand -base64 32)" -ForegroundColor Gray
$JWT_SECRET = Read-Host "JWT Secret"

if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) {
    Write-Host "❌ JWT Secret is required!" -ForegroundColor Red
    exit 1
}

if ($JWT_SECRET.Length -lt 32) {
    Write-Host "⚠️  Warning: JWT Secret should be at least 32 characters" -ForegroundColor Yellow
}

# Get Redis Host (if created)
$REDIS_HOST = "10.106.178.204"  # Default from creation, will update if needed
Write-Host ""
Write-Host "📝 Redis Host (press Enter to use default: $REDIS_HOST):" -ForegroundColor Yellow
$redisInput = Read-Host "Redis Host"
if (![string]::IsNullOrWhiteSpace($redisInput)) {
    $REDIS_HOST = $redisInput
}

# Build and Deploy
Write-Host ""
$deploy = Read-Host "🏗️  Build and deploy to Cloud Run? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "Building application..." -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    # Build using Cloud Build with substitutions
    gcloud builds submit `
        --config=config/cloudbuild.yaml `
        --substitutions="_MONGODB_URI=$MONGODB_URI,_JWT_SECRET=$JWT_SECRET"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build complete!" -ForegroundColor Green
        
        # Update service with VPC connector and Redis
        Write-Host "🔗 Connecting to VPC and setting environment..." -ForegroundColor Yellow
        
        gcloud run services update $SERVICE_NAME `
            --region=$REGION `
            --vpc-connector=$VPC_CONNECTOR `
            --vpc-egress=private-ranges-only `
            --set-env-vars="REDIS_HOST=$REDIS_HOST,REDIS_PORT=6379" `
            --update-env-vars="MONGODB_URI=$MONGODB_URI,JWT_SECRET=$JWT_SECRET"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment complete!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  VPC connection failed, but service is deployed" -ForegroundColor Yellow
            Write-Host "   You may need to configure VPC manually in Cloud Console" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Common issues:" -ForegroundColor Yellow
        Write-Host "   - Check MongoDB URI is correct" -ForegroundColor Gray
        Write-Host "   - Check Dockerfile in backend/ directory" -ForegroundColor Gray
        Write-Host "   - View logs: https://console.cloud.google.com/cloud-build/builds" -ForegroundColor Gray
        exit 1
    }
}

# Get service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME `
    --region=$REGION `
    --format="value(status.url)"

# Test deployment
Write-Host ""
$test = Read-Host "🧪 Test deployment? (y/n)"
if ($test -eq "y" -or $test -eq "Y") {
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$SERVICE_URL/api/health" -Method Get
    
    if ($response.status -eq "OK") {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Health check returned unexpected response" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update environment variables in Cloud Run console:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME" -ForegroundColor Gray
Write-Host "2. Set REDIS_HOST (check Memorystore console)" -ForegroundColor White
Write-Host "3. Verify MongoDB connection string" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Monitoring Links:" -ForegroundColor Yellow
Write-Host "- Cloud Run Metrics:" -ForegroundColor White
Write-Host "  https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics" -ForegroundColor Gray
Write-Host "- Redis Monitoring:" -ForegroundColor White
Write-Host "  https://console.cloud.google.com/memorystore/redis/locations/$REGION/instances/$REDIS_INSTANCE" -ForegroundColor Gray
Write-Host "- Cloud Build History:" -ForegroundColor White
Write-Host "  https://console.cloud.google.com/cloud-build/builds" -ForegroundColor Gray
Write-Host ""
Write-Host "💰 Estimated monthly cost: `$760-1,395" -ForegroundColor Magenta
Write-Host ""
Write-Host "📖 Full documentation: docs/SCALING_1000_USERS.md" -ForegroundColor Cyan
Write-Host ""
