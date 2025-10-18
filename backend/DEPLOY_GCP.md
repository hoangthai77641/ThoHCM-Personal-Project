# 🚀 Deploy Backend to Google Cloud Platform

## Prerequisites

1. **Google Cloud Account**: Create account at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install `gcloud` CLI
   ```bash
   # Windows (PowerShell)
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

3. **MongoDB Atlas**: Setup cloud MongoDB at [mongodb.com/atlas](https://www.mongodb.com/atlas)

## Step-by-Step Deployment

### 1. Initialize Google Cloud

```powershell
# Login to Google Cloud
gcloud auth login

# Create new project (or use existing)
gcloud projects create thohcm-app --name="Thợ HCM"

# Set project as default
gcloud config set project thohcm-app

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (Free tier available)
3. Create database user with password
4. Whitelist IP: `0.0.0.0/0` (or specific GCP IPs)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/thohcm`

### 3. Configure Environment Variables

#### Option A: Using Secret Manager (Recommended)

```powershell
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "your-jwt-secret-key-here" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/thohcm" | gcloud secrets create MONGODB_URI --data-file=-

# Grant App Engine access to secrets
$PROJECT_NUMBER = gcloud projects describe thohcm-app --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:thohcm-app@appspot.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

Update `app.yaml` to use secrets:
```yaml
env_variables:
  NODE_ENV: "production"
  
# Add this section
entrypoint: node server.js

# For secrets
env:
  - name: JWT_SECRET
    value_from:
      secret_key_ref:
        name: JWT_SECRET
        key: latest
```

#### Option B: Direct in app.yaml (Less secure)

Edit `app.yaml`:
```yaml
env_variables:
  NODE_ENV: "production"
  MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/thohcm"
  JWT_SECRET: "your-jwt-secret-key"
  PORT: "8080"
```

### 4. Deploy to App Engine

```powershell
# Navigate to backend folder
cd d:\Thai\root\ThoHCM\backend

# Deploy application
gcloud app deploy app.yaml

# View your app
gcloud app browse

# Stream logs
gcloud app logs tail -s default
```

### 5. Post-Deployment Setup

#### Seed Database (if needed)
```powershell
# SSH into App Engine instance
gcloud app instances ssh [INSTANCE_ID] --service=default --version=[VERSION_ID]

# Run seed script
npm run seed
```

Or run locally pointing to Atlas:
```powershell
# Set MongoDB URI temporarily
$env:MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/thohcm"

# Run seed
npm run seed
```

### 6. Configure Custom Domain (Optional)

```powershell
# Add custom domain
gcloud app domain-mappings create "www.thohcm.com" --certificate-management=AUTOMATIC

# Update DNS records as instructed
```

### 7. Setup Cloud Storage for Uploads (Recommended)

For production, use Google Cloud Storage instead of local filesystem:

```powershell
# Create storage bucket
gsutil mb -p thohcm-app -c standard -l asia-southeast1 gs://thohcm-uploads

# Make bucket publicly readable (for avatars, banners)
gsutil iam ch allUsers:objectViewer gs://thohcm-uploads
```

Update backend code to use Cloud Storage (requires `@google-cloud/storage` package).

## Monitoring & Management

### View Logs
```powershell
# Tail logs
gcloud app logs tail -s default

# View in Console
gcloud app logs read
```

### Update Application
```powershell
# Make changes, then redeploy
gcloud app deploy

# Deploy specific version
gcloud app deploy --version=v2 --no-promote
```

### Manage Versions
```powershell
# List versions
gcloud app versions list

# Switch traffic between versions
gcloud app services set-traffic default --splits=v2=1

# Delete old version
gcloud app versions delete v1
```

## Cost Optimization

### Free Tier Limits
- 28 instance hours per day
- 1GB egress per day
- App Engine: F1 instance free within limits

### Tips
1. Use `automatic_scaling` with low `min_instances` (0 or 1)
2. Set appropriate `max_instances` to control costs
3. Use Cloud CDN for static assets
4. Monitor usage in Google Cloud Console

## Troubleshooting

### App fails to start
```powershell
# Check logs
gcloud app logs tail -s default

# Common issues:
# - Missing environment variables
# - MongoDB connection failure
# - Port binding (must use process.env.PORT)
```

### Connection to MongoDB fails
- Check Atlas IP whitelist (allow 0.0.0.0/0 or GCP IPs)
- Verify credentials in connection string
- Check if database user has correct permissions

### Socket.IO connection issues
- Ensure Socket.IO CORS is configured for your domain
- Check if WebSocket connections are allowed (App Engine supports them)

## Security Checklist

- [ ] Use Secret Manager for sensitive data
- [ ] Enable HTTPS only (set `secure: always` in app.yaml)
- [ ] Configure CORS properly
- [ ] Set up Cloud Armor for DDoS protection
- [ ] Enable Cloud Logging and Monitoring
- [ ] Regular security updates for dependencies
- [ ] Use Cloud IAM for access control

## Environment Variables Reference

Required environment variables:
- `NODE_ENV`: "production"
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration (e.g., "7d")
- `PORT`: Port to listen on (App Engine sets this automatically)

Optional:
- `SOCKET_CORS_ORIGIN`: Frontend URL for CORS
- `MAX_FILE_SIZE`: Maximum upload file size

## Resources

- [Google Cloud Console](https://console.cloud.google.com)
- [App Engine Documentation](https://cloud.google.com/appengine/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)

## Support

For issues with deployment, check:
1. Google Cloud Console logs
2. MongoDB Atlas monitoring
3. Application logs via `gcloud app logs`

---

**Next Steps**: After backend is deployed, deploy the web frontend to Firebase Hosting or Cloud Storage + Cloud CDN.
