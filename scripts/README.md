# 🔧 Scripts

Thư mục này chứa các automation scripts để deploy, build và run ứng dụng ThoHCM.

## 📜 Scripts Available

### **Deployment Scripts**

#### `deploy-cloudrun.ps1` (PowerShell)
- Deploy backend lên Google Cloud Run
- Cấu hình environment variables
- Build và push Docker image

#### `deploy-cloudrun.sh` (Bash)
- Phiên bản Linux/macOS của deploy script
- Tương thích với CI/CD pipeline
- Cross-platform deployment

### **Development Scripts**

#### `run-worker-app.bat` (Windows Batch)
- Quick start Flutter worker app trên Windows
- Setup Android emulator
- Debug mode với hot reload

#### `run-worker-app.ps1` (PowerShell)
- Enhanced version với logging
- Automatic dependency check
- Error handling và troubleshooting

#### `set-env-vars.sh` (Bash)
- Setup environment variables cho development
- Load config từ files
- Cross-platform environment setup

## 🚀 Usage

### Windows Users:
```powershell
# Deploy to Cloud Run
.\scripts\deploy-cloudrun.ps1

# Run mobile app
.\scripts\run-worker-app.ps1
```

### Linux/macOS Users:
```bash
# Deploy to Cloud Run  
chmod +x scripts/deploy-cloudrun.sh
./scripts/deploy-cloudrun.sh

# Setup environment
chmod +x scripts/set-env-vars.sh
source ./scripts/set-env-vars.sh
```

## ⚠️ Prerequisites

- Google Cloud SDK installed
- Flutter SDK for mobile scripts
- Node.js for backend deployment
- Proper authentication (service account keys)

## 🔗 Related

- [Configuration Files](../config/README.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)