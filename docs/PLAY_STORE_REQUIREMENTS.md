# Play Store Assets Requirements

## 📱 Google Play Store Asset Requirements

### 🎯 **REQUIRED ASSETS:**

#### **1. App Icon**
- **Size**: 512 x 512 pixels
- **Format**: PNG (no transparency)
- **Max size**: 1MB
- **Location**: `android/app/src/main/res/mipmap-xxxhdpi/launcher_icon.png`

#### **2. Feature Graphic** 
- **Size**: 1024 x 500 pixels
- **Format**: JPG or PNG
- **Purpose**: Main banner in Play Store

#### **3. Screenshots (REQUIRED)**
- **Phone**: At least 2, up to 8 screenshots
- **Tablet**: Recommended if supporting tablets
- **Sizes**: Various device sizes supported
- **Format**: JPG or PNG

#### **4. Short Description**
- **Max**: 80 characters
- **Languages**: Vietnamese + English
- **Example**: "Ứng dụng đặt thợ sửa chữa tại nhà nhanh chóng, tiện lợi"

#### **5. Full Description**
- **Max**: 4000 characters
- **Should include**: 
  - App features
  - How it works
  - Contact information
  - Keywords for SEO

### 📋 **OPTIONAL BUT RECOMMENDED:**

#### **6. Promotional Video**
- **Max**: 30 seconds
- **Format**: YouTube link
- **Purpose**: Show app in action

#### **7. Additional Graphics**
- **Promo graphic**: 180 x 120 pixels
- **TV banner**: 1280 x 720 pixels (if TV support)

### 🔧 **TECHNICAL REQUIREMENTS:**

#### **8. App Bundle (AAB)**
- **Preferred** over APK
- **Max size**: 150MB for base AAB
- **Signing**: Must be signed with production keystore

#### **9. Target SDK**
- **Minimum**: API 34 (Android 14) for new apps
- **Recommended**: Latest stable API level

#### **10. Permissions**
- **Declare all permissions** in manifest
- **Explain sensitive permissions** in description
- **Follow principle of least privilege**

### 📄 **LEGAL REQUIREMENTS:**

#### **11. Privacy Policy (MANDATORY)**
- **Must have** publicly accessible URL
- **Content**: How you collect, use, share data
- **Languages**: Same as your app
- **Location**: Can host on GitHub Pages, website, etc.

#### **12. Content Rating**
- **Complete questionnaire** in Play Console
- **Categories**: Everyone, Teen, Mature 17+, etc.
- **Be accurate** - wrong rating can get app removed

### 🎯 **STORE LISTING OPTIMIZATION:**

#### **13. Keywords & SEO**
- **App title**: Include main keywords
- **Description**: Natural keyword usage  
- **Categories**: Choose most relevant category

#### **14. Localization**
- **Vietnamese**: Primary language
- **English**: Secondary (broader reach)
- **Consider other languages** if targeting international

### ⚡ **QUICK START CHECKLIST:**

```
□ Create production keystore
□ Build signed AAB
□ Create 512x512 app icon
□ Take 2+ screenshots
□ Write short description (80 chars)
□ Write full description (up to 4000 chars)
□ Create privacy policy page
□ Setup Google Play Console account ($25)
□ Complete content rating questionnaire
□ Upload AAB and assets
□ Submit for review
```

### 🔗 **Useful Tools:**

- **Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
- **Screenshot Tools**: Device frames, mockups
- **Privacy Policy Generator**: Various online tools
- **Play Console**: https://play.google.com/console

### ⏱️ **Timeline:**
- **First submission**: 2-3 days review
- **Updates**: Few hours to 1 day
- **Policy violations**: Can take longer

---

**Remember**: Always test your app thoroughly before submission!