# Firebase Console SHA1 Addition Guide

## 📷 Screenshot Guide for Adding SHA1 to Firebase

### Step 1: Firebase Console Home
- URL: https://console.firebase.google.com/
- Look for: "ThoHCM Frontend" project card
- Action: Click on the project

### Step 2: Project Overview
- Location: Left sidebar
- Look for: ⚙️ gear icon at bottom
- Action: Click "Project settings"

### Step 3: Project Settings
- Tab: "General" (should be selected by default)
- Scroll to: "Your apps" section
- Look for: Android icon with "com.thohcm.workerapp"
- Action: Click on the Android app

### Step 4: App Configuration
- Scroll to: "SDK setup and configuration" section
- Look for: "SHA certificate fingerprints"
- Current fingerprints shown (if any)
- Action: Click "Add fingerprint" button

### Step 5: Add Fingerprint Dialog
- Dropdown: Select "SHA-1"
- Text field: Paste your SHA1
- Value: E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93
- Action: Click "Save"

### Step 6: Download New Config
- After saving SHA1
- Look for: "google-services.json" download link
- Action: Click "Download google-services.json"
- Save to: android/app/ folder (replace existing)

## ✅ Verification Steps

### Check Both SHA1s Are Present:
1. Debug SHA1: 48:F1:AE:73:33:71:15:D9:51:DE:DD:7D:DB:84:BB:59:FF:3B:76:63
2. Production SHA1: E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93

### File Replacement:
- Old: android/app/google-services.json (680 bytes)
- New: android/app/google-services.json (should be similar size)
- Backup: android/app/google-services.json.backup

## 🚨 Common Issues:

### Issue 1: Wrong Project
- Make sure you're in "ThoHCM Frontend" project
- Check URL contains your project ID

### Issue 2: Wrong App
- Make sure package name is "com.thohcm.workerapp"
- Don't confuse with web app

### Issue 3: SHA1 Format
- Must be uppercase
- Use colons (:) between pairs
- 40 characters total (20 pairs)
- Example: E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93