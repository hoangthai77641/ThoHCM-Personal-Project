# 🔥 Firebase Cloud Messaging Setup Guide

## 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" hoặc chọn existing project `thohcm-frontend`
3. Enable Firebase Cloud Messaging

## 2. Generate Service Account Key

```bash
# 1. Vào Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate new private key"
# 3. Download file JSON (tên: firebase-adminsdk-xxxxx.json)
# 4. Copy vào backend/config/
```

## 3. Cập nhật Backend Code

```javascript
// backend/services/NotificationService.js
const admin = require('firebase-admin');

// Initialize Firebase Admin (thêm vào constructor)
constructor(io) {
  this.io = io;
  
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    const serviceAccount = require('../config/firebase-adminsdk-xxxxx.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

// Enable push notifications (uncomment lines 196-220)
async sendPushNotification(userId, notificationData) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (user && user.fcmToken) {
      const message = {
        token: user.fcmToken,
        notification: {
          title: notificationData.title,
          body: notificationData.body
        },
        data: notificationData.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Push notification sent:', response);
      return true;
    }
  } catch (error) {
    console.error('FCM Error:', error);
    return false;
  }
}
```

## 4. Mobile App Changes

```dart
// mobile/lib/core/services/firebase_service.dart
class FirebaseService {
  static Future<void> initialize() async {
    await Firebase.initializeApp();
    
    // Get FCM token
    String? token = await FirebaseMessaging.instance.getToken();
    
    // Send token to backend
    await ApiClient().post('/api/users/fcm-token', {'token': token});
  }
}
```

## 5. Environment Variables

```bash
# Backend .env
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-adminsdk-xxxxx.json

# Hoặc set trong app.yaml
env_variables:
  GOOGLE_APPLICATION_CREDENTIALS: "./config/firebase-adminsdk-xxxxx.json"
```