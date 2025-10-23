# ☁️ Google Cloud Storage Setup Guide

## 1. Tạo Storage Bucket

```bash
# Create bucket với tên unique
gsutil mb gs://thohcm-storage-$(date +%s)

# Hoặc dùng tên cố định (cần unique globally)  
gsutil mb gs://thohcm-storage-bucket

# Set public access
gsutil iam ch allUsers:objectViewer gs://thohcm-storage-bucket
```

## 2. Cập nhật Backend Environment

```yaml
# backend/app.yaml
env_variables:
  GCS_BUCKET_NAME: "thohcm-storage-bucket"
  GOOGLE_APPLICATION_CREDENTIALS: "./config/thohcm-application-475603-73975784b63a.json"
```

## 3. Test Storage Integration

```bash
# Restart backend sau khi update
cd backend
npm start

# Check logs cho "Google Cloud Storage is ready"
```

## 4. Verify Permissions

Service account cần các roles:
- ✅ Storage Admin (đã có)
- ✅ Storage Object Admin (đã có) 
- Storage Legacy Bucket Owner
- Storage Legacy Object Owner

## 5. Test Upload API

```bash
# Test banner upload
curl -X POST "https://your-app.appspot.com/api/banners" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Banner" \
  -F "image=@test-image.jpg"

# Test avatar upload  
curl -X POST "https://your-app.appspot.com/api/users/avatar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@avatar.jpg"
```

## Troubleshooting

### Lỗi "Bucket does not exist"
```bash
# Kiểm tra bucket tồn tại
gsutil ls gs://thohcm-storage-bucket

# Tạo mới nếu chưa có
gsutil mb gs://thohcm-storage-bucket
```

### Lỗi "Access denied" 
```bash
# Check service account permissions
gcloud projects get-iam-policy thohcm-application-475603

# Add Storage Admin role nếu thiếu
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:service-account@thohcm-application-475603.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```