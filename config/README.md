# ⚙️ Configuration

Thư mục này chứa tất cả file cấu hình quan trọng cho dự án ThoHCM.

## 🔐 Configuration Files

### **cloudbuild.yaml**
- Google Cloud Build configuration
- CI/CD pipeline definition
- Docker build steps và deployment

### **connection-string-mongodb.txt**
- MongoDB Atlas connection string
- Database credentials (encrypted/secured)
- Cluster configuration

### **FirebaseConfigObject.txt**  
- Firebase project configuration
- Web app config object
- Authentication và hosting settings

### **thohcm-application-475603-73975784b63a.json**
- Google Cloud Platform service account key
- Authentication cho Cloud services
- Permissions và IAM roles

## 🔒 Security Notes

⚠️ **IMPORTANT:** Các file trong thư mục này chứa thông tin nhạy cảm!

- **KHÔNG** commit service account keys lên git public
- **SỬ DỤNG** environment variables trong production  
- **BẢO MẬT** database connection strings
- **ĐỊNH KỲ** rotate API keys và credentials

## 🌍 Environment Setup

### Development:
```bash
# Load development config
source scripts/set-env-vars.sh
```

### Production:
```bash
# Set via environment variables
export MONGODB_URI="mongodb+srv://..."
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

## 📋 Environment Variables

### Required Variables:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication secret
- `GOOGLE_APPLICATION_CREDENTIALS` - GCP service account
- `FIREBASE_CONFIG` - Firebase configuration

### Optional Variables:
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 3000)
- `RATE_LIMIT_BYPASS` - Development rate limiting bypass

## 🔗 Related

- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Scripts](../scripts/README.md)
- [Environment Setup](../docs/MOBILE_TESTING_GUIDE.md)