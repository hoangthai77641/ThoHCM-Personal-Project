#!/bin/bash
# 🔧 GCP Services Setup Script

echo "=== Enabling required GCP services ==="

# Set project
gcloud config set project thohcm-application-475603

# Enable APIs
echo "Enabling Firebase APIs..."
gcloud services enable firebase.googleapis.com
gcloud services enable firebasemessaging.googleapis.com

echo "Enabling Storage APIs..."  
gcloud services enable storage.googleapis.com

echo "Enabling additional APIs..."
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable secretmanager.googleapis.com

echo "=== Adding IAM permissions ==="

# Add Firebase permissions
echo "Adding Firebase Admin permissions..."
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/firebase.messaging.admin"

# Add Storage permissions
echo "Adding Storage permissions..."
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/storage.legacyBucketOwner"

echo "=== Creating Storage Bucket ==="

# Create bucket với unique name
BUCKET_NAME="thohcm-storage-$(date +%s)"
echo "Creating bucket: $BUCKET_NAME"

gsutil mb gs://$BUCKET_NAME

# Set public access for uploaded files
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

echo "=== Verification ==="
echo "Enabled services:"
gcloud services list --enabled --filter="name:firebase OR name:storage"

echo "Storage buckets:"  
gsutil ls

echo "=== Next Steps ==="
echo "1. Update backend environment variable GCS_BUCKET_NAME=$BUCKET_NAME"
echo "2. Download Firebase service account key from Firebase Console"
echo "3. Update NotificationService.js to enable FCM"
echo "4. Deploy backend with: gcloud app deploy"

echo "✅ Setup completed!"