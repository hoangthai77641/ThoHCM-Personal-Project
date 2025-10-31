# ⚠️ CRITICAL: Credentials Security Fix

## Vấn đề phát hiện
Các file credentials có thể đã bị commit vào Git repository:
- `backend/firebase-thohcm-frontend-key.json`
- `backend/config/firebase-admin-sdk.json`
- `backend/config/*.json`
- `config/thohcm-application-*.json`

## Bước 1: Kiểm tra Git History

```bash
# Kiểm tra xem các files credentials đã từng bị commit chưa
git log --all --full-history -- "*.json" | grep -E "(firebase|thohcm-application)" | head -20

# Kiểm tra tất cả các file .json trong history
git log --all --oneline --name-only -- "*.json" | grep -E "(firebase|thohcm|credential|key)" | sort | uniq
```

## Bước 2: Nếu Chưa Bao Giờ Commit (An Toàn)

Nếu các files chưa bao giờ được commit, bạn chỉ cần đảm bảo .gitignore đã đúng:

```bash
# Kiểm tra .gitignore đã có rules này chưa
cat .gitignore | grep "*.json"

# Verify files không bị track
git status --ignored | grep -E "(firebase|thohcm-application|credential)"
```

✅ Nếu .gitignore đã đúng và files không bị track → **AN TOÀN, không cần làm gì**

## Bước 3: Nếu ĐÃ Commit Vào Git (NGUY HIỂM)

### Option A: Sử dụng BFG Repo-Cleaner (Khuyến nghị)

```bash
# 1. Tải BFG
# Download từ: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Backup repository
cd d:\Thai\root
cp -r ThoHCM ThoHCM-backup

# 3. Clean credentials
cd ThoHCM
java -jar bfg.jar --delete-files "{firebase-*-key.json,*-adminsdk-*.json,thohcm-application-*.json}"

# 4. Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (CHỈ nếu đã push lên remote)
git push --force
```

### Option B: Git Filter-Branch (Manual)

```bash
cd d:\Thai\root\ThoHCM

# Backup first!
git clone --mirror . ../ThoHCM-backup.git

# Remove credentials from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/firebase-thohcm-frontend-key.json \
   backend/config/firebase-admin-sdk.json \
   backend/config/firebase-adminsdk-thohcm-frontend.json \
   backend/config/thohcm-frontend-firebase-adminsdk-fbsvc-*.json \
   config/firebase-thohcm-frontend-key.json \
   config/firebase-admin-sdk.json \
   config/thohcm-application-*.json" \
  --prune-empty --tag-name-filter cat -- --all

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push nếu cần
# git push --force --all
# git push --force --tags
```

## Bước 4: Revoke Và Tạo Credentials Mới

### Firebase Credentials

1. Vào Firebase Console: https://console.firebase.google.com/
2. Project Settings → Service Accounts
3. **DELETE** các service account keys cũ
4. Generate new private key
5. Download file mới
6. Update `.env`:
   ```
   FIREBASE_ADMIN_SDK_PATH=./config/firebase-admin-sdk-NEW.json
   ```

### Google Cloud Service Account

1. Vào GCP Console: https://console.cloud.google.com/
2. IAM & Admin → Service Accounts
3. Tìm service account đang dùng
4. Keys tab → **DELETE** các keys cũ
5. Add Key → Create new key → JSON
6. Update `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./config/thohcm-application-NEW.json
   ```

## Bước 5: Verify Security

```bash
# 1. Verify credentials đã bị xóa khỏi Git history
git log --all --full-history -- "*firebase*.json" "*thohcm-application*.json"
# Kết quả phải rỗng hoặc chỉ có commit deletion

# 2. Verify .gitignore hoạt động
echo "test-credential.json" > backend/test-credential.json
git status
# File phải được ignored

# 3. Test new credentials
cd backend
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-admin-sdk-NEW.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
console.log('✅ Firebase credentials valid');
"
```

## Bước 6: Update .gitignore (Đã làm)

File `.gitignore` hiện tại đã đúng:
```gitignore
# Google Cloud credentials
*.json
!package*.json
!tsconfig*.json

# Sensitive configuration files  
config/thohcm-application-*.json
config/connection-string-mongodb.txt
config/FirebaseConfigObject.txt
thohcm-application-*.json
service-account-*.json
```

## Bước 7: Notify Team (Nếu có)

Nếu repository này có nhiều người:
1. Thông báo credentials đã bị compromised
2. Yêu cầu mọi người pull latest code
3. Update local `.env` với credentials mới

## Security Checklist

- [ ] Kiểm tra Git history cho credentials
- [ ] Xóa credentials khỏi Git history (nếu cần)
- [ ] Revoke tất cả credentials cũ trên Firebase/GCP
- [ ] Generate credentials mới
- [ ] Update `.env` files
- [ ] Test credentials mới hoạt động
- [ ] Verify .gitignore đang hoạt động
- [ ] Force push cleaned repository (nếu đã push lên remote)
- [ ] Notify team members (nếu có)

## ⚠️ LƯU Ý QUAN TRỌNG

1. **KHÔNG BAO GIỜ** commit lại credentials sau khi đã clean
2. **LUÔN LUÔN** kiểm tra `git status` trước khi commit
3. Sử dụng pre-commit hooks để prevent:
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   if git diff --cached --name-only | grep -qE "\.json$" | grep -vE "(package|tsconfig)"; then
     echo "⚠️  Warning: JSON file detected. Make sure it's not credentials!"
     git diff --cached --name-only | grep -E "\.json$"
     read -p "Continue? (y/N) " -n 1 -r
     echo
     if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
     fi
   fi
   ```

## Monitoring

Sau khi fix, monitor:
1. Firebase usage dashboard cho suspicious activity
2. GCP logs cho unauthorized access attempts
3. Setup billing alerts

## Contact

Nếu phát hiện credentials đã bị lộ và có hoạt động đáng ngờ:
1. Revoke ngay lập tức
2. Report security incident
3. Check logs để xác định scope of breach
