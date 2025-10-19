# Cloud Run Migration Guide - ThoHCM

## 🎯 Mục tiêu
Migrate từ App Engine Standard sang Cloud Run để hỗ trợ WebSocket cho real-time features.

## 📋 Prerequisites

### 1. Cài đặt Google Cloud CLI
```bash
# Download từ https://cloud.google.com/sdk/docs/install
# Hoặc sử dụng package manager
choco install gcloudsdk  # Windows
```

### 2. Authentication
```bash
gcloud auth login
gcloud config set project thohcm-application-475603
```

### 3. Set up GitHub Secrets (cho auto deployment)
Trong GitHub repository settings, thêm các secrets:
- `GCP_SA_KEY`: Service Account JSON key
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: JWT secret key
- `ALLOWED_ORIGINS`: Danh sách domain frontend

## 🚀 Deployment Options

### Option 1: Manual Deployment (PowerShell)
```powershell
# Chạy trong PowerShell
.\deploy-cloudrun.ps1
```

### Option 2: GitHub Actions (Recommended)
```bash
# Commit và push code
git add .
git commit -m "feat: Migrate to Cloud Run with WebSocket support"
git push origin main
```

### Option 3: Manual gcloud commands
```bash
# Build and deploy
gcloud builds submit --config=cloudbuild.yaml

# Set environment variables
gcloud run services update thohcm-backend --region=asia-southeast1 \
  --set-env-vars MONGODB_URI="mongodb+srv://..." \
  --set-env-vars JWT_SECRET="your-secret" \
  --set-env-vars ALLOWED_ORIGINS="https://thohcm-frontend.web.app"
```

## 🔧 Configuration

### 1. Environment Variables
Sau khi deploy, set các biến môi trường:
```bash
gcloud run services update thohcm-backend --region=asia-southeast1 \
  --set-env-vars MONGODB_URI="mongodb+srv://thohcm_admin:thohcmadmin@thohcm-cluster.bxqkpw6.mongodb.net/thohcm" \
  --set-env-vars JWT_SECRET="your-strong-jwt-secret" \
  --set-env-vars ALLOWED_ORIGINS="https://thohcm-frontend.web.app,https://thohcm-application.web.app"
```

### 2. Update Frontend API URL
Sau khi Cloud Run deploy xong, cập nhật URL trong frontend:
```javascript
// web/src/api.js
const API_URL = 'https://thohcm-backend-xxxxx-as.a.run.app'
```

## ✅ Verification

### 1. Test Health Endpoint
```bash
curl https://your-cloudrun-url/api/health
```

### 2. Test WebSocket Connection
- Login vào app
- Check browser console cho "Connected to notification service"

### 3. Test API Endpoints
```bash
# Test registration
curl -X POST https://your-cloudrun-url/api/users/register -H "Content-Type: application/json" -d '{"name":"Test","phone":"0123456789","password":"Test123"}'

# Test login
curl -X POST https://your-cloudrun-url/api/users/login -H "Content-Type: application/json" -d '{"phone":"0123456789","password":"Test123"}'
```

## 🎯 Benefits of Cloud Run

✅ **WebSocket Support**: Full real-time features  
✅ **Auto-scaling**: 0 to 1000+ instances  
✅ **Pay per use**: Only pay when serving requests  
✅ **Container-based**: More flexible than App Engine  
✅ **HTTPS**: Automatic SSL certificates  
✅ **Custom domains**: Easy domain mapping  

## 🔄 Rollback Plan

Nếu có vấn đề, có thể rollback về App Engine:
```bash
# Re-deploy App Engine
cd backend
gcloud app deploy app.yaml
```

## 📊 Monitoring

- **Cloud Console**: https://console.cloud.google.com/run
- **Logs**: https://console.cloud.google.com/logs
- **Metrics**: CPU, Memory, Request latency
- **Error tracking**: Cloud Error Reporting

## 💰 Cost Estimation

Cloud Run pricing (Asia Southeast 1):
- **CPU**: $0.000024 per vCPU-second
- **Memory**: $0.0000025 per GiB-second  
- **Requests**: $0.40 per million requests
- **Free tier**: 2 million requests/month

Ước tính: ~$10-30/month cho traffic moderate.