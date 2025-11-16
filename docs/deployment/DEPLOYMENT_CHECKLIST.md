# ✅ Pre-Deployment Checklist for GCP

## Backend Cleanup ✅ COMPLETED

- [x] Removed all test files (test-*.js, test-*.html)
- [x] Removed debug files (debug-db.js)
- [x] Removed temporary check/verify scripts
- [x] Removed development documentation (AVATAR_UPLOAD_GUIDE.md, fix-dependencies.md)
- [x] Cleaned uploads folder
- [x] Created .gcloudignore file
- [x] Created app.yaml for App Engine
- [x] Created deployment guide (DEPLOY_GCP.md)

## Before First Deploy

### 1. MongoDB Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (free tier: M0 Sandbox)
- [ ] Create database user with password
- [ ] Whitelist IP: 0.0.0.0/0 (allow all IPs)
- [ ] Get connection string
- [ ] Test connection locally

### 2. Google Cloud Setup
- [ ] Create Google Cloud account
- [ ] Install gcloud CLI
- [ ] Login: `gcloud auth login`
- [ ] Create project: `gcloud projects create thohcm-app`
- [ ] Set project: `gcloud config set project thohcm-app`
- [ ] Enable App Engine: `gcloud services enable appengine.googleapis.com`
- [ ] Enable Cloud Build: `gcloud services enable cloudbuild.googleapis.com`

### 3. Environment Configuration
- [ ] Update app.yaml with production environment variables
- [ ] Or setup Secret Manager for sensitive data
- [ ] Configure MONGODB_URI
- [ ] Configure JWT_SECRET (generate strong secret)
- [ ] Configure ALLOWED_ORIGINS with production frontend URL

### 4. Code Review
- [ ] Check server.js uses process.env.PORT ✅
- [ ] Verify all routes are working
- [ ] Test Socket.IO connections
- [ ] Check file upload paths
- [ ] Verify CORS configuration includes production domain

### 5. Dependencies
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Check package.json has all required dependencies
- [ ] Verify no development-only dependencies in production

### 6. Database
- [ ] Prepare seed data if needed
- [ ] Plan database migration strategy
- [ ] Backup existing data if migrating

## Deployment Steps

```powershell
# 1. Navigate to backend
cd d:\Thai\root\ThoHCM\backend

# 2. Test locally with production-like settings
$env:NODE_ENV="production"
$env:MONGODB_URI="your-atlas-connection-string"
npm start

# 3. Deploy to GCP
gcloud app deploy

# 4. View logs
gcloud app logs tail -s default

# 5. Open in browser
gcloud app browse
```

## Post-Deployment

### Immediate Checks
- [ ] App is accessible via GCP URL
- [ ] MongoDB connection successful
- [ ] API endpoints responding correctly
- [ ] Socket.IO connections working
- [ ] File uploads working (or migrated to Cloud Storage)
- [ ] Check logs for errors

### Optional Enhancements
- [ ] Setup Cloud Storage for file uploads
- [ ] Configure Cloud CDN for static assets
- [ ] Setup custom domain
- [ ] Configure Cloud Monitoring and Alerts
- [ ] Setup Cloud Logging
- [ ] Configure Cloud Scheduler for cron jobs (if needed)
- [ ] Setup Cloud Armor for DDoS protection
- [ ] Configure automatic backups

### Performance Optimization
- [ ] Review instance class (F1, F2, F4)
- [ ] Configure automatic scaling parameters
- [ ] Setup caching strategy
- [ ] Optimize database queries with indexes
- [ ] Enable compression

### Security
- [ ] Review IAM permissions
- [ ] Enable HTTPS only
- [ ] Configure security headers (Helmet.js)
- [ ] Setup rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Cost Monitoring

### Track Usage
- [ ] Setup billing alerts
- [ ] Monitor App Engine quotas
- [ ] Check MongoDB Atlas usage
- [ ] Review egress/ingress costs
- [ ] Monitor API calls

### Free Tier Limits
- App Engine: 28 instance hours/day (F1/F2)
- Cloud Storage: 5GB
- Cloud Build: 120 build minutes/day
- MongoDB Atlas: 512MB storage (M0)

## Troubleshooting Guide

### App won't start
1. Check logs: `gcloud app logs tail -s default`
2. Verify environment variables in app.yaml
3. Check MongoDB connection string
4. Ensure PORT is not hardcoded

### Database connection fails
1. Check MongoDB Atlas IP whitelist
2. Verify connection string format
3. Check database user permissions
4. Test connection from local machine

### Socket.IO not connecting
1. Verify CORS origins include production URL
2. Check WebSocket support (App Engine supports it)
3. Review Socket.IO configuration in server.js

### File uploads failing
1. Check file size limits
2. Verify uploads directory permissions
3. Consider migrating to Cloud Storage

## Rollback Plan

If deployment fails:
```powershell
# List versions
gcloud app versions list

# Roll back to previous version
gcloud app services set-traffic default --splits=[PREVIOUS_VERSION]=1

# Delete failed version
gcloud app versions delete [FAILED_VERSION]
```

## Next Steps After Backend

1. **Deploy Web Frontend**
   - Firebase Hosting (recommended)
   - Cloud Storage + Cloud CDN
   - Cloud Run (containerized)

2. **Deploy Mobile App**
   - Build APK for Android
   - Build IPA for iOS
   - Publish to Google Play / App Store

3. **Setup CI/CD**
   - Cloud Build triggers
   - GitHub Actions
   - Automated testing

## Resources

- [Deployment Guide](./DEPLOY_GCP.md) - Detailed deployment instructions
- [Google Cloud Console](https://console.cloud.google.com)
- [MongoDB Atlas](https://cloud.mongodb.com)

---

**Status**: Backend cleanup completed ✅ | Ready for deployment 🚀
