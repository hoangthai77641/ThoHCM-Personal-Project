# GitHub Secrets Setup Guide

## ❌ Vấn đề hiện tại

GitHub Actions deployment thất bại vì:
1. **MongoDB credentials sai** - đang dùng password cũ `thohcmadmin`
2. **Thiếu database name** trong MongoDB URI
3. **GitHub Secrets chưa được cập nhật** với credentials mới

## ✅ Giải pháp: Cập nhật GitHub Secrets

### Bước 1: Truy cập GitHub Secrets

1. Vào repository: https://github.com/hoangthai77641/ThoHCM-Personal-Project
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** hoặc update secret existing

### Bước 2: Thêm/Cập nhật các Secrets

#### Secret 1: MONGODB_URI
- **Name:** `MONGODB_URI`
- **Value:** 
```
mongodb+srv://thohcm_admin:admin77641@thohcm-cluster.bxqkpw6.mongodb.net/thohcm?retryWrites=true&w=majority&appName=ThoHCM-Cluster
```
- ⚠️ **CHÚ Ý:** 
  - Password là `admin77641` (NOT `thohcmadmin`)
  - Phải có `/thohcm` (database name) trước `?retryWrites`

#### Secret 2: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:**
```
chxbxZ/Adv7hAdWWZRppVqJhZvb6zKzIkFW5fF6s9Ck=
```

#### Secret 3: GCP_SA_KEY (nếu chưa có)
- **Name:** `GCP_SA_KEY`
- **Value:** Nội dung file `config/thohcm-application-475603-73975784b63a.json`
- Lấy từ: `D:\Thai\root\ThoHCM\config\thohcm-application-475603-73975784b63a.json`

### Bước 3: Verify Secrets

Sau khi thêm xong, bạn sẽ thấy 3 secrets:
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`  
- ✅ `GCP_SA_KEY`

### Bước 4: Trigger Deployment

**Option A: Push code mới**
```powershell
git commit --allow-empty -m "chore: Trigger deployment with updated secrets"
git push origin main
```

**Option B: Manual trigger**
1. Vào tab **Actions** trong GitHub
2. Chọn workflow **Deploy Backend to Cloud Run**
3. Click **Run workflow** → **Run workflow**

## 🔧 Alternative: Deploy từ Local (Temporary Fix)

Nếu không muốn update GitHub Secrets ngay, có thể deploy trực tiếp từ local:

```powershell
# Set credentials
$MONGODB_URI = "mongodb+srv://thohcm_admin:admin77641@thohcm-cluster.bxqkpw6.mongodb.net/thohcm?retryWrites=true&w=majority&appName=ThoHCM-Cluster"
$JWT_SECRET = "chxbxZ/Adv7hAdWWZRppVqJhZvb6zKzIkFW5fF6s9Ck="

# Deploy
gcloud builds submit --config=config/cloudbuild.yaml --timeout=20m `
  --substitutions="_MONGODB_URI=$MONGODB_URI,_JWT_SECRET=$JWT_SECRET"
```

## 📊 Kiểm tra sau khi Deploy

### 1. Check service status
```powershell
gcloud run services describe thohcm-backend --region=asia-southeast1
```

### 2. Test health endpoint
```powershell
curl https://thohcm-backend-181755246333.asia-southeast1.run.app/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","timestamp":"2025-11-14T..."}
```

### 3. Check logs
```powershell
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=thohcm-backend" --limit=20
```

Logs phải có:
- ✅ `MongoDB connected`
- ✅ `Redis connected successfully`
- ✅ `Server listening at http://0.0.0.0:8080`

## ⚠️ Troubleshooting

### Lỗi: "Container failed to become healthy"
- **Nguyên nhân:** MongoDB authentication thất bại
- **Giải pháp:** Kiểm tra password trong `MONGODB_URI` secret phải là `admin77641`

### Lỗi: "Database not found"
- **Nguyên nhân:** Thiếu `/thohcm` trong MongoDB URI
- **Giải pháp:** URI phải có format: `...mongodb.net/thohcm?retryWrites=...`

### Lỗi: "Startup probe timeout"
- **Nguyên nhân:** Container start quá lâu (thường do MongoDB connection fail)
- **Giải pháp:** 
  1. Check MongoDB credentials
  2. Check network connectivity (Direct VPC đã configured)
  3. Tăng timeout nếu cần

## 📝 Notes

- GitHub Secrets được encrypt và không thể xem lại sau khi nhập
- Khi update secret, các deployments mới sẽ tự động dùng value mới
- Không commit secrets vào code (đã có trong `.gitignore`)
- Service account `github-actions@thohcm-application-475603.iam.gserviceaccount.com` đã có đủ permissions

## 🔗 Resources

- GitHub Secrets docs: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Cloud Run deployment: https://cloud.google.com/run/docs/deploying
- Repository settings: https://github.com/hoangthai77641/ThoHCM-Personal-Project/settings/secrets/actions
