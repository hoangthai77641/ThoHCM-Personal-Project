# 🌐 Hướng Dẫn Bật GitHub Pages

## ✅ Đã Hoàn Thành
- [x] Tạo file `privacy-policy.html`
- [x] Push lên GitHub repository

## 📋 Các Bước Tiếp Theo

### Bước 1: Truy cập GitHub Repository
1. Mở trình duyệt và vào: https://github.com/hoangthai77641/ThoHCM-Personal-Project
2. Đăng nhập tài khoản GitHub của bạn

### Bước 2: Vào Settings
1. Click vào tab **Settings** (phía trên bên phải repository)
2. Trong menu bên trái, tìm và click vào **Pages**

### Bước 3: Cấu Hình GitHub Pages
1. Trong phần **Source**:
   - Branch: Chọn **main** (hoặc **master**)
   - Folder: Chọn **/ (root)**
   
2. Click nút **Save**

3. Đợi 1-2 phút để GitHub xử lý

### Bước 4: Lấy URL Privacy Policy
Sau khi GitHub Pages được bật, URL sẽ là:

```
https://hoangthai77641.github.io/ThoHCM-Personal-Project/privacy-policy.html
```

### Bước 5: Kiểm Tra URL
1. Mở URL trên trong trình duyệt
2. Kiểm tra nội dung hiển thị đúng
3. Test chuyển đổi ngôn ngữ (Tiếng Việt / English)

### Bước 6: Sử Dụng URL trong Google Play Console
1. Copy URL: `https://hoangthai77641.github.io/ThoHCM-Personal-Project/privacy-policy.html`
2. Dán vào Google Play Console > Privacy Policy
3. Save

## ⚠️ Lưu Ý Quan Trọng

### Nếu URL không hoạt động ngay:
- Đợi thêm 5-10 phút để GitHub Pages deploy
- Kiểm tra lại Settings > Pages xem trạng thái deployment
- Clear cache trình duyệt và thử lại

### Nếu gặp lỗi 404:
- Đảm bảo file `privacy-policy.html` có ở root của repository
- Kiểm tra branch đã chọn đúng là `main`
- Kiểm tra file đã được push thành công: `git log --oneline -1`

## 🎯 Kết Quả Mong Đợi

Khi mở URL, bạn sẽ thấy:
- ✅ Header với logo ThoHCM màu xanh
- ✅ Tiêu đề "Privacy Policy / Chính Sách Bảo Mật"
- ✅ 2 nút chuyển ngôn ngữ (Tiếng Việt / English)
- ✅ Nội dung chính sách bảo mật đầy đủ
- ✅ Thông tin liên hệ
- ✅ Ngày cập nhật: November 2025

## 📞 Troubleshooting

### Vấn đề: GitHub Pages không xuất hiện trong Settings
**Giải pháp**: Repository phải là public. Nếu là private, cần nâng cấp GitHub Pro.

### Vấn đề: URL bị lỗi SSL/HTTPS
**Giải pháp**: Đợi GitHub tự động cấp SSL certificate (thường 10-30 phút)

### Vấn đề: Nội dung không cập nhật
**Giải pháp**: 
```bash
# Clear cache và force push
git add privacy-policy.html
git commit -m "Update privacy policy"
git push
```

## ✅ Checklist Hoàn Thành

- [ ] Truy cập GitHub Settings
- [ ] Bật GitHub Pages với branch `main`
- [ ] Đợi deployment hoàn tất
- [ ] Test URL trong trình duyệt
- [ ] Copy URL cho Google Play Console
- [ ] Paste URL vào Privacy Policy field
- [ ] Save và verify trong Play Console

## 🔗 Links Hữu Ích

- **Repository**: https://github.com/hoangthai77641/ThoHCM-Personal-Project
- **Privacy Policy URL**: https://hoangthai77641.github.io/ThoHCM-Personal-Project/privacy-policy.html
- **GitHub Pages Docs**: https://docs.github.com/en/pages

---

**Status**: ✅ File đã được push, cần bật GitHub Pages  
**Next Action**: Vào GitHub Settings > Pages và bật GitHub Pages  
**Estimated Time**: 2-3 phút
