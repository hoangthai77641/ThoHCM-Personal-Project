# 🔧 GCP Services Setup Script (PowerShell)

Write-Host "=== Enabling required GCP services ===" -ForegroundColor Green

# Set project
gcloud config set project thohcm-application-475603

# Enable APIs
Write-Host "Enabling Firebase APIs..." -ForegroundColor Yellow
gcloud services enable firebase.googleapis.com
gcloud services enable firebasemessaging.googleapis.com

Write-Host "Enabling Storage APIs..." -ForegroundColor Yellow
gcloud services enable storage.googleapis.com

Write-Host "Enabling additional APIs..." -ForegroundColor Yellow
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable secretmanager.googleapis.com

Write-Host "=== Adding IAM permissions ===" -ForegroundColor Green

# Add Firebase permissions
Write-Host "Adding Firebase Admin permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding thohcm-application-475603 `
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" `
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding thohcm-application-475603 `
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" `
  --role="roles/firebase.messaging.admin"

# Add Storage permissions
Write-Host "Adding Storage permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding thohcm-application-475603 `
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" `
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding thohcm-application-475603 `
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" `
  --role="roles/storage.legacyBucketOwner"

Write-Host "=== Creating Storage Bucket ===" -ForegroundColor Green

# Create bucket với unique name
$BUCKET_NAME = "thohcm-storage-$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-Host "Creating bucket: $BUCKET_NAME" -ForegroundColor Yellow

gsutil mb gs://$BUCKET_NAME

# Set public access for uploaded files
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

Write-Host "=== Verification ===" -ForegroundColor Green
Write-Host "Enabled services:" -ForegroundColor Yellow
gcloud services list --enabled --filter="name:firebase OR name:storage"

Write-Host "Storage buckets:" -ForegroundColor Yellow
gsutil ls

Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Update backend environment variable GCS_BUCKET_NAME=$BUCKET_NAME" -ForegroundColor Cyan
Write-Host "2. Download Firebase service account key from Firebase Console" -ForegroundColor Cyan
Write-Host "3. Update NotificationService.js to enable FCM" -ForegroundColor Cyan
Write-Host "4. Deploy backend with: gcloud app deploy" -ForegroundColor Cyan

Write-Host "✅ Setup completed!" -ForegroundColor Green