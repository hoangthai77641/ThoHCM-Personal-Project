# 🔐 GCP IAM Service Account Setup

## Current Service Accounts (từ IAM screenshot):

### 1. **Default Compute Service Account**
- Email: `181755246333-compute@developer.gserviceaccount.com`
- Role: Editor ✅
- **Purpose:** App Engine runtime

### 2. **GitHub Actions Service Account** 
- Email: `github-actions@thohcm-application-475603.iam.gserviceaccount.com`
- Roles: 
  - App Engine Admin ✅
  - App Engine Deployer ✅  
  - App Engine Service Admin ✅
  - Cloud Build Editor ✅
  - Cloud Build Service Account ✅
  - Cloud Run Admin ✅
  - Service Account Token Creator ✅
  - Service Account User ✅
  - Service Usage Admin ✅
  - Storage Admin ✅
- **Purpose:** CI/CD deployment

### 3. **App Engine Default Service Account**
- Email: `thohcm-application-475603@appspot.gserviceaccount.com` 
- Role: Editor ✅
- **Purpose:** App runtime default

### 4. **Storage Service Account**
- Email: `thohcm-storage@thohcm-application-475603.iam.gserviceaccount.com`
- Role: Storage Admin ✅
- **Purpose:** Cloud Storage operations

## ⚠️ Missing Permissions:

### **Firebase Admin SDK**
Cần add role cho service account để sử dụng Firebase:

```bash
# Add Firebase Admin role
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Add Firebase Messaging Admin
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/firebase.messaging.admin"
```

### **Cloud Storage Public Access**
Cần permission để make files public:

```bash
# Add Storage Object Admin
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Add Storage Legacy roles
gcloud projects add-iam-policy-binding thohcm-application-475603 \
  --member="serviceAccount:thohcm-application-475603@appspot.gserviceaccount.com" \
  --role="roles/storage.legacyBucketOwner"
```

## 🔧 Services cần enable:

```bash
# Enable required APIs
gcloud services enable firebase.googleapis.com
gcloud services enable storage.googleapis.com  
gcloud services enable firebasemessaging.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Verify enabled services
gcloud services list --enabled
```

## 🧪 Test Commands:

```bash
# Test Firebase access
gcloud firebase projects list

# Test Storage access  
gsutil ls gs://

# Test service account
gcloud auth list
```

## 📝 Next Steps:

1. ✅ Enable Firebase APIs
2. ✅ Add Firebase roles to service account
3. ✅ Create/verify Storage bucket exists
4. ✅ Update backend code to use Firebase Admin SDK
5. ✅ Deploy updated backend
6. ✅ Test notifications end-to-end