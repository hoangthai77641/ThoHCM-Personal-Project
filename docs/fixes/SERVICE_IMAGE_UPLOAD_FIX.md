# 🔧 Service Image/Video Upload Fix

## 📋 Vấn Đề

Mobile app (Flutter) không thể upload ảnh/video từ thiết bị khi tạo dịch vụ mới. Chỉ có thể thêm ảnh/video từ URL.

### Triệu Chứng
```
Error loading image: https://thohcm-backend.../storage/services/images-xxx.jpg
HTTP request failed, statusCode: 404
```

### Nguyên Nhân

Backend đang sử dụng **2 middleware upload khác nhau**:

1. **`upload.js`** (local storage) - được dùng cho services
   - Lưu file vào thư mục `backend/storage/services/`
   - ❌ **Vấn đề**: Khi deploy lên Google Cloud Run, local storage bị xóa sau mỗi lần restart container
   - File được upload nhưng không thể truy cập được sau đó

2. **`upload-gcs.js`** (Google Cloud Storage) - được dùng cho avatars và banners
   - Upload file lên Google Cloud Storage bucket
   - ✅ File được lưu trữ vĩnh viễn và có thể truy cập từ URL public

### Phân Tích Code

**Trước khi sửa:**

```javascript
// backend/routes/serviceRoutes.js
const { uploadServiceMedia } = require('../middleware/upload'); // ❌ Local storage

// backend/controllers/serviceController.js
req.files.images.forEach(file => {
  imageUrls.push(`/storage/services/${file.filename}`); // ❌ Local path
});
```

**Mobile app gửi file đúng cách:**
```dart
// mobile/worker_app/lib/features/services/services_repository.dart
Future<Map<String, dynamic>> _createWithMedia(
  Map<String, dynamic> payload, {
  List<File>? images,
  List<File>? videos,
}) async {
  final formData = FormData.fromMap(payload);
  
  // Add image files
  if (images != null) {
    for (int i = 0; i < images.length; i++) {
      final file = images[i];
      formData.files.add(
        MapEntry(
          'images',
          await MultipartFile.fromFile(file.path, filename: 'image_$i.jpg'),
        ),
      );
    }
  }
  // ... ✅ Code này đúng!
}
```

## ✅ Giải Pháp

### 1. Thay đổi middleware upload

**File: `backend/routes/serviceRoutes.js`**
```javascript
// Trước
const { uploadServiceMedia } = require('../middleware/upload');

// Sau
const { uploadServiceMedia } = require('../middleware/upload-gcs');
```

### 2. Thêm middleware upload service media lên GCS

**File: `backend/middleware/upload-gcs.js`**

Thêm middleware mới để xử lý upload service images/videos:

```javascript
// Middleware to handle service media upload to GCS
const uploadServiceMediaMiddleware = (req, res, next) => {
  const upload = serviceUpload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 3 }
  ]);

  upload(req, res, async (err) => {
    if (err) {
      // Handle errors...
      return res.status(400).json({ error: 'Upload error', message: err.message });
    }
    
    if (!req.files || ...) {
      return next(); // No files uploaded
    }
    
    try {
      // Upload images to GCS
      if (req.files.images && req.files.images.length > 0) {
        const imageUrls = [];
        for (const file of req.files.images) {
          const { publicUrl } = await uploadToGCS(file, 'services');
          imageUrls.push(publicUrl);
        }
        // Store GCS URLs in req.files
        req.files.images.forEach((file, index) => {
          file.gcsUrl = imageUrls[index];
          file.cloudStoragePublicUrl = imageUrls[index];
        });
      }
      
      // Upload videos to GCS (tương tự)
      // ...
      
      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Failed to upload files to cloud storage', 
        error: error.message 
      });
    }
  });
};
```

### 3. Cập nhật controller để sử dụng GCS URLs

**File: `backend/controllers/serviceController.js`**

```javascript
// Trong createService và updateService
if (req.files) {
  if (req.files.images) {
    req.files.images.forEach(file => {
      // Use GCS URL if available, otherwise local path
      const fileUrl = file.cloudStoragePublicUrl || file.gcsUrl || `/storage/services/${file.filename}`;
      imageUrls.push(fileUrl);
    });
  }
  
  if (req.files.videos) {
    req.files.videos.forEach(file => {
      const fileUrl = file.cloudStoragePublicUrl || file.gcsUrl || `/storage/services/${file.filename}`;
      videoUrls.push(fileUrl);
    });
  }
}
```

## 🔍 Cách Hoạt Động

### Flow Upload Mới

1. **Mobile app** chọn ảnh từ thiết bị
   ```dart
   final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
   final file = File(image.path);
   _newImageFiles.add(file); // ✅ File được lưu
   ```

2. **Mobile app** gửi file qua FormData
   ```dart
   formData.files.add(
     MapEntry('images', await MultipartFile.fromFile(file.path))
   );
   ```

3. **Backend middleware** (`upload-gcs.js`) nhận file
   - Multer lưu file vào memory (buffer)
   - Upload file lên Google Cloud Storage
   - Tạo public URL: `https://storage.googleapis.com/thohcm-storage/services/images-xxx.jpg`
   - Gắn URL vào `req.files[i].cloudStoragePublicUrl`

4. **Backend controller** lưu URL vào database
   ```javascript
   const fileUrl = file.cloudStoragePublicUrl; // GCS URL
   imageUrls.push(fileUrl);
   service.images = imageUrls;
   ```

5. **Mobile app** hiển thị ảnh từ GCS URL
   ```dart
   Image.network(service['images'][0]) // ✅ Load từ GCS
   ```

## 📊 So Sánh

| Aspect | Local Storage (upload.js) | Google Cloud Storage (upload-gcs.js) |
|--------|---------------------------|--------------------------------------|
| **Lưu trữ** | `backend/storage/services/` | Google Cloud Storage bucket |
| **Persistence** | ❌ Mất khi container restart | ✅ Vĩnh viễn |
| **URL** | `/storage/services/file.jpg` | `https://storage.googleapis.com/...` |
| **Scalability** | ❌ Giới hạn disk | ✅ Unlimited |
| **CDN** | ❌ Không | ✅ Google CDN |
| **Cost** | Free | ~$0.02/GB/month |

## ✅ Kết Quả

Sau khi sửa:
- ✅ Mobile app có thể upload ảnh/video từ thiết bị
- ✅ File được lưu trữ vĩnh viễn trên Google Cloud Storage
- ✅ URL public có thể truy cập từ mọi nơi
- ✅ Không bị mất file khi deploy/restart
- ✅ Tương thích với cả local development và production

## 🧪 Testing

### Test trên Local
```bash
cd backend
npm run dev
```

### Test trên Mobile
1. Mở app worker
2. Vào "Dịch vụ của tôi" → "Thêm dịch vụ"
3. Chọn ảnh từ thư viện hoặc chụp ảnh mới
4. Điền thông tin và lưu
5. Kiểm tra ảnh hiển thị đúng

### Verify GCS Upload
```bash
# Check GCS bucket
gsutil ls gs://thohcm-storage/services/

# Check file permissions
gsutil acl get gs://thohcm-storage/services/images-xxx.jpg
```

## 📝 Notes

- **Environment Variables**: Đảm bảo `GCS_BUCKET_NAME` và `GOOGLE_APPLICATION_CREDENTIALS` được set đúng
- **Permissions**: Service account cần có quyền `Storage Object Creator` và `Storage Object Viewer`
- **Backward Compatibility**: Code vẫn fallback về local path nếu GCS không available
- **File Size Limits**: 10MB cho images/videos (có thể tăng nếu cần)

## 🔗 Related Files

- `backend/routes/serviceRoutes.js` - Route configuration
- `backend/middleware/upload-gcs.js` - GCS upload middleware
- `backend/controllers/serviceController.js` - Service controller
- `mobile/worker_app/lib/features/services/services_repository.dart` - Mobile upload logic
- `mobile/worker_app/lib/features/services/media_picker_new.dart` - Media picker widget
