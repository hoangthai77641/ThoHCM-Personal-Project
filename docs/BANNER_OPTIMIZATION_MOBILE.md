# Banner Display Optimization - Mobile Web vs Flutter App

## Vấn đề phát hiện

### 1. **Flutter Mobile App** ✅
- Hiển thị **1 ảnh duy nhất** với tỷ lệ aspect ratio chuẩn
- `BoxFit.cover` đảm bảo ảnh fill toàn bộ container
- Height cố định: **200px**
- Text overlay rõ ràng với gradient background
- **Trải nghiệm tốt**

### 2. **Web Mobile (Safari/Chrome iOS)** ❌
- Hiển thị **3 ảnh ghép nối** (collage effect)
- Ảnh bị crop không đều
- Text "Thợ HCM" bị che khuất
- Height nhỏ: **160px** (mobile), 200px (tablet)
- **Trải nghiệm kém**

### 3. **Web Desktop** ✅
- Hero section đầy đủ
- Height: **240px**
- Text và CTA rõ ràng
- **Trải nghiệm tốt**

## Nguyên nhân

### A. **CSS Background-size: cover**
```css
.banner-slide {
  background-size: cover;  /* ❌ Gây ra crop không đồng nhất */
  background-position: center;
}
```

**Vấn đề:**
- `background-size: cover` sẽ scale ảnh để fill container
- Trên mobile với height nhỏ (160px), ảnh landscape bị crop mạnh
- Tạo hiệu ứng "ghép 3 ảnh" vì chỉ thấy phần giữa của ảnh

### B. **Height không đồng bộ**
```css
/* Mobile */
.banner-container { height: 160px; }  /* ❌ Quá nhỏ */

/* Tablet */
@media (min-width: 640px) {
  .banner-container { height: 200px; }  /* ✅ OK */
}

/* Desktop */
@media (min-width: 768px) {
  .banner-container { height: 240px; }  /* ✅ OK */
}
```

**So sánh Flutter:**
```dart
Container(
  height: 200,  /* ✅ Cố định 200px cho mọi device */
  child: Image.network(
    fit: BoxFit.cover,  /* ✅ Cover đúng cách */
  ),
)
```

### C. **Aspect Ratio không được maintain**
- Web không có constraint về aspect ratio
- Flutter tự động maintain aspect ratio với `BoxFit.cover`

## Giải pháp

### 1. **Tăng height cho mobile** (Quick fix)
```css
.banner-container {
  height: 200px; /* Thay vì 160px */
}
```

### 2. **Sử dụng aspect ratio** (Recommended)
```css
.banner-container {
  aspect-ratio: 16 / 9; /* Hoặc 2 / 1 */
  height: auto;
  max-height: 240px;
}
```

### 3. **Sử dụng object-fit với img tag** (Best practice)
Thay vì dùng background-image, dùng `<img>` tag:

```jsx
<div className="banner-slide active">
  <img 
    src={banner.imageUrl} 
    alt={banner.title}
    className="banner-image"
  />
  <div className="banner-overlay">
    {/* Content */}
  </div>
</div>
```

```css
.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

### 4. **Responsive height với clamp()**
```css
.banner-container {
  height: clamp(200px, 30vw, 300px);
}
```

## Implementation Plan

### Phase 1: Quick Fix (Immediate)
- [ ] Tăng mobile height từ 160px → 200px
- [ ] Test trên iPhone Safari

### Phase 2: Proper Fix (Recommended)
- [ ] Refactor BannerSlider.jsx để dùng `<img>` tag
- [ ] Apply `object-fit: cover` với aspect-ratio
- [ ] Đồng bộ height với Flutter app (200px)
- [ ] Test cross-browser

### Phase 3: Advanced (Optional)
- [ ] Lazy loading cho banners
- [ ] Responsive images với srcset
- [ ] WebP format với fallback
- [ ] Optimize image size cho mobile

## Code Changes

### File: `web/src/styles.css`

**Before:**
```css
.banner-container {
  height: 160px; /* Mobile */
}
```

**After:**
```css
.banner-container {
  height: 200px; /* Mobile - đồng bộ với Flutter */
  min-height: 200px;
}

@media (min-width: 640px) {
  .banner-container {
    height: 220px; /* Tablet */
  }
}

@media (min-width: 768px) {
  .banner-container {
    height: 240px; /* Desktop */
  }
}
```

### File: `web/src/components/BannerSlider.jsx`

**Option A: Keep background-image (Quick)**
```jsx
// No changes needed, just update CSS
```

**Option B: Use img tag (Better)**
```jsx
<div className="banner-slide active">
  <img 
    src={getImageUrl(banner.imageUrl)}
    alt={banner.title || 'Banner'}
    className="banner-image"
    loading="lazy"
  />
  <div className="banner-overlay">
    <div className="banner-content">
      {banner.title && <h2 className="banner-title">{banner.title}</h2>}
      {banner.content && <p className="banner-description">{banner.content}</p>}
    </div>
  </div>
</div>
```

```css
.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

## Testing Checklist

- [ ] iPhone Safari - Portrait
- [ ] iPhone Safari - Landscape
- [ ] iPhone Chrome - Portrait
- [ ] iPhone Chrome - Landscape
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Tablet (iPad)

## Expected Results

### Before Fix:
- ❌ Mobile: 160px height, ảnh bị crop mạnh, hiệu ứng "3 ảnh ghép"
- ❌ Text bị che khuất
- ❌ Không đồng bộ với Flutter app

### After Fix:
- ✅ Mobile: 200px height, ảnh hiển thị đầy đủ
- ✅ Text rõ ràng
- ✅ Đồng bộ với Flutter app
- ✅ Consistent experience across platforms

## Performance Considerations

1. **Image Optimization:**
   - Compress images trước khi upload
   - Recommended size: 1200x600px (2:1 ratio)
   - Format: WebP với JPEG fallback
   - Max file size: 200KB

2. **Lazy Loading:**
   - Chỉ load banner đầu tiên
   - Lazy load các banner còn lại

3. **Caching:**
   - Set proper cache headers
   - CDN cho static images

## Related Files

- `web/src/components/BannerSlider.jsx`
- `web/src/styles.css` (lines 1800-2000)
- `mobile/worker_app/lib/features/widgets/banner_slider.dart`
- `backend/routes/bannerRoutes.js`
- `backend/models/Banner.js`
