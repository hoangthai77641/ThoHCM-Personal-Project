# 🚀 Production Deployment Guide

## Overview

This project uses **GitHub Actions CI/CD** to automatically deploy to Google Cloud Platform:

- **Backend** → Google App Engine
- **Frontend** → Firebase Hosting  
- **Database** → MongoDB Atlas
- **Mobile** → Manual build and publish

## 🔧 Setup Process

### 1. Create GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
    --description="Service account for GitHub Actions" \
    --display-name="GitHub Actions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding thohcm-app \
    --member="serviceAccount:github-actions@thohcm-app.iam.gserviceaccount.com" \
    --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding thohcm-app \
    --member="serviceAccount:github-actions@thohcm-app.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@thohcm-app.iam.gserviceaccount.com
```

### 2. Setup GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

Add these secrets:

```
GCP_SA_KEY          = Content of github-actions-key.json file
MONGODB_URI         = mongodb+srv://user:pass@cluster.mongodb.net/thohcm
JWT_SECRET          = your-strong-jwt-secret-64-chars
ALLOWED_ORIGINS     = https://your-frontend-domain.com
FIREBASE_TOKEN      = firebase login:ci token
```

### 3. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and get token
firebase login:ci

# Initialize Firebase in web folder
cd web
firebase init hosting
```

### 4. MongoDB Atlas Setup

1. Create MongoDB Atlas cluster (M0 free tier)
2. Create database user
3. Whitelist IPs: `0.0.0.0/0`
4. Get connection string

## 📦 Deployment Workflow

### Automatic Deployment

```mermaid
graph LR
    A[Push to main] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D[Build Backend]
    D --> E[Deploy to App Engine]
    E --> F[Build Frontend]
    F --> G[Deploy to Firebase]
```

1. **Push to main branch** → triggers deployment
2. **Tests run** → ensure code quality
3. **Backend deploys** → Google App Engine
4. **Frontend deploys** → Firebase Hosting
5. **Notification sent** → deployment status

### Manual Deployment (Emergency)

```bash
# Backend only
cd backend
gcloud app deploy

# Frontend only
cd web
npm run build
firebase deploy --only hosting
```

## 🔍 Monitoring

### Check Deployment Status

- **GitHub Actions**: Repository → Actions tab
- **GCP Console**: https://console.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com

### View Logs

```bash
# Backend logs
gcloud app logs tail -s default

# Build logs
gcloud builds list
```

### URLs

- **Backend API**: https://thohcm-app.uc.r.appspot.com
- **Frontend**: https://thohcm-app.web.app (Firebase)
- **Admin Panel**: https://thohcm-app.web.app/admin

## 🚨 Troubleshooting

### Common Issues

**1. Deployment fails**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure service account has proper permissions

**2. Backend doesn't start**
- Check environment variables in app.yaml
- Verify MongoDB connection string
- Review App Engine logs

**3. Frontend build fails**
- Check API URL configuration
- Verify all dependencies are installed
- Review build logs

### Rollback Process

```bash
# List versions
gcloud app versions list

# Switch traffic to previous version
gcloud app services set-traffic default --splits=previous-version=1

# Delete failed version
gcloud app versions delete failed-version
```

## 📊 Cost Optimization

### Free Tier Limits

- **App Engine**: 28 instance hours/day (F1)
- **Firebase Hosting**: 10GB storage, 360MB/day transfer
- **MongoDB Atlas**: 512MB storage (M0)
- **Cloud Build**: 120 build minutes/day

### Tips

1. Use automatic scaling with low min_instances
2. Optimize bundle size for frontend
3. Use CDN for static assets
4. Monitor quotas regularly

## 🔐 Security

### Environment Variables

Never commit sensitive data to Git:
- MongoDB credentials
- JWT secrets
- API keys
- Service account keys

Use GitHub Secrets for all sensitive configuration.

### Best Practices

1. **Branch Protection**: Require PR reviews
2. **Dependency Updates**: Regular security updates
3. **Access Control**: Limit GCP permissions
4. **Monitoring**: Setup error tracking and alerts

## 📱 Mobile App Deployment

Mobile apps need manual build and publish:

### Android

```bash
cd mobile/worker_app
flutter build apk --release
# Upload to Google Play Console
```

### iOS

```bash
cd mobile/worker_app
flutter build ios --release
# Upload to App Store Connect via Xcode
```

## 🔄 Development Workflow

### Branch Strategy

```
main          → Production deployments
develop       → Staging deployments  
feature/*     → Feature development
hotfix/*      → Emergency fixes
```

### Pull Request Process

1. Create feature branch
2. Make changes and commit
3. Push and create Pull Request
4. Code review and approval
5. Merge to main → auto deploy

## 📞 Support

For deployment issues:

1. Check GitHub Actions logs
2. Review GCP Console logs
3. Verify all secrets and configurations
4. Test locally with production settings

---

**Last Updated**: October 2025
**Environment**: Production
**Status**: ✅ Automated CI/CD Active