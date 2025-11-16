# Mobile App Updates - Driver Support

## 📱 Tổng Quan

Mobile app hiện tại có **2 apps riêng biệt**:
- `customer_app`: Cho khách hàng
- `worker_app`: Cho thợ

**Để hỗ trợ Driver**, có 2 phương án:

### Phương Án 1: Dùng Chung Worker App (KHUYẾN NGHỊ) ✅
- Driver và Worker có chức năng giống nhau 80%
- Chỉ khác: category services và vehicle specs
- Tiết kiệm công maintain

### Phương Án 2: Tạo Driver App Riêng
- Độc lập hoàn toàn
- UI/UX tối ưu riêng cho driver
- Tốn công maintain nhiều hơn

**👉 Khuyến nghị: Phương án 1 - Dùng chung Worker App**

---

## 🔄 Các Cập Nhật Cần Thiết (Phương Án 1)

### 1. Register Screen
**File**: `worker_app/lib/features/auth/register_screen.dart`

**Hiện tại**: Hardcode role 'worker'
```dart
await context.read<AuthProvider>().registerWorker(
  name: _name.text.trim(),
  phone: _phone.text.trim(),
  password: _password.text,
  address: _address.text.trim().isEmpty ? null : _address.text.trim(),
);
```

**Cần thay đổi**: Thêm role selection
```dart
// Thêm state
String _selectedRole = 'worker'; // 'worker' hoặc 'driver'

// Thêm UI selector
Padding(
  padding: const EdgeInsets.symmetric(vertical: 16),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'Loại tài khoản',
        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
      const SizedBox(height: 8),
      SegmentedButton<String>(
        segments: const [
          ButtonSegment(
            value: 'worker',
            label: Text('Thợ'),
            icon: Icon(Icons.build),
          ),
          ButtonSegment(
            value: 'driver',
            label: Text('Tài xế'),
            icon: Icon(Icons.local_shipping),
          ),
        ],
        selected: {_selectedRole},
        onSelectionChanged: (Set<String> newSelection) {
          setState(() {
            _selectedRole = newSelection.first;
          });
        },
      ),
      const SizedBox(height: 8),
      Text(
        _selectedRole == 'worker' 
          ? 'Cung cấp dịch vụ sửa chữa điện lạnh, máy giặt, v.v.'
          : 'Cung cấp dịch vụ vận chuyển hàng hóa',
        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
      ),
    ],
  ),
),

// Update register call
await context.read<AuthProvider>().register(
  name: _name.text.trim(),
  phone: _phone.text.trim(),
  password: _password.text,
  role: _selectedRole, // Pass role
  address: _address.text.trim().isEmpty ? null : _address.text.trim(),
);
```

### 2. Auth Repository
**File**: `worker_app/lib/features/auth/auth_repository.dart`

**Cần thêm**: Generic register function
```dart
Future<void> register({
  required String name,
  required String phone,
  required String password,
  required String role, // 'worker' or 'driver'
  String? address,
}) async {
  try {
    final response = await _dio.post(
      '/api/users/register',
      data: {
        'name': name,
        'phone': phone,
        'password': password,
        'role': role, // Dynamic role
        if (address != null && address.isNotEmpty) 'address': address,
      },
    );
    // Handle response
  } catch (e) {
    throw Exception('Registration failed: $e');
  }
}

// Keep registerWorker for backward compatibility
Future<void> registerWorker({...}) async {
  return register(name: name, phone: phone, password: password, role: 'worker', address: address);
}
```

### 3. Auth Provider
**File**: `worker_app/lib/features/auth/auth_provider.dart`

**Cần thêm**: Generic register
```dart
Future<bool> register({
  required String name,
  required String phone,
  required String password,
  required String role,
  String? address,
}) async {
  loading = true;
  error = null;
  notifyListeners();
  
  try {
    await _repo.register(
      name: name,
      phone: phone,
      password: password,
      role: role,
      address: address,
    );
    loading = false;
    notifyListeners();
    return true;
  } catch (e) {
    error = e.toString();
    loading = false;
    notifyListeners();
    return false;
  }
}
```

### 4. Service Edit Screen
**File**: `worker_app/lib/features/services/service_edit_screen.dart`

**Cần thêm**: Vehicle specs fields

```dart
// Add controllers
final _loadCapacityController = TextEditingController();
final _lengthController = TextEditingController();
final _widthController = TextEditingController();
final _heightController = TextEditingController();

// Add state
String? _selectedCategory;
bool get _isTransportation => _selectedCategory == 'Dịch Vụ Vận Chuyển';
bool get _isDriver => _currentUser?.role == 'driver';

// In build method, add category selector
DropdownButtonFormField<String>(
  value: _selectedCategory,
  decoration: const InputDecoration(
    labelText: 'Danh mục dịch vụ',
  ),
  items: [
    'Điện Lạnh',
    'Máy Giặt',
    'Điện Gia Dụng',
    'Hệ Thống Điện',
    'Sửa Xe Đạp',
    'Sửa Xe Máy',
    'Sửa Xe Oto',
    'Sửa Xe Điện',
    'Dịch Vụ Vận Chuyển',
  ].map((cat) => DropdownMenuItem(
    value: cat,
    child: Text(cat),
    // Disable if driver and not transportation
    enabled: !_isDriver || cat == 'Dịch Vụ Vận Chuyển',
  )).toList(),
  onChanged: (value) {
    setState(() {
      _selectedCategory = value;
    });
  },
),

// Add vehicle specs section (show only if transportation)
if (_isTransportation) ...[
  const SizedBox(height: 20),
  Card(
    color: Colors.blue[50],
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_shipping, color: Colors.blue[700]),
              const SizedBox(width: 8),
              Text(
                'Thông Tin Xe',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[700],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Thông tin xe là bắt buộc cho dịch vụ vận chuyển',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          
          // Load capacity
          TextFormField(
            controller: _loadCapacityController,
            decoration: const InputDecoration(
              labelText: 'Tải trọng (kg) *',
              hintText: 'Ví dụ: 1000 (cho xe 1 tấn)',
              prefixIcon: Icon(Icons.scale),
            ),
            keyboardType: TextInputType.number,
            validator: (v) {
              if (_isTransportation && (v == null || v.isEmpty)) {
                return 'Tải trọng là bắt buộc';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          
          // Dimensions
          const Text(
            'Kích thước thùng xe (mét)',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _lengthController,
                  decoration: const InputDecoration(
                    labelText: 'Dài (m) *',
                    hintText: '2.5',
                  ),
                  keyboardType: TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    if (_isTransportation && (v == null || v.isEmpty)) {
                      return 'Bắt buộc';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextFormField(
                  controller: _widthController,
                  decoration: const InputDecoration(
                    labelText: 'Rộng (m) *',
                    hintText: '1.6',
                  ),
                  keyboardType: TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    if (_isTransportation && (v == null || v.isEmpty)) {
                      return 'Bắt buộc';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextFormField(
                  controller: _heightController,
                  decoration: const InputDecoration(
                    labelText: 'Cao (m) *',
                    hintText: '1.8',
                  ),
                  keyboardType: TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    if (_isTransportation && (v == null || v.isEmpty)) {
                      return 'Bắt buộc';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  ),
],

// In submit function, include vehicle specs
final serviceData = {
  'name': _nameController.text.trim(),
  'description': _descriptionController.text.trim(),
  'basePrice': double.parse(_priceController.text),
  'category': _selectedCategory,
  if (_isTransportation) 'vehicleSpecs': {
    'loadCapacity': double.parse(_loadCapacityController.text),
    'truckBedDimensions': {
      'length': double.parse(_lengthController.text),
      'width': double.parse(_widthController.text),
      'height': double.parse(_heightController.text),
    },
  },
};
```

### 5. Services List Screen
**File**: `worker_app/lib/features/services/services_screen.dart`

**Cần thêm**: Display vehicle specs

```dart
// In service card builder
if (service.category == 'Dịch Vụ Vận Chuyển' && service.vehicleSpecs != null) ...[
  const SizedBox(height: 8),
  Container(
    padding: const EdgeInsets.all(8),
    decoration: BoxDecoration(
      color: Colors.blue[50],
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      children: [
        Icon(Icons.local_shipping, size: 16, color: Colors.blue[700]),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            '${service.vehicleSpecs!.loadCapacity}kg • '
            '${service.vehicleSpecs!.truckBedDimensions.length}x'
            '${service.vehicleSpecs!.truckBedDimensions.width}x'
            '${service.vehicleSpecs!.truckBedDimensions.height}m',
            style: TextStyle(fontSize: 12, color: Colors.blue[700]),
          ),
        ),
      ],
    ),
  ),
],
```

### 6. Service Model
**File**: `worker_app/lib/core/models/service.dart` (hoặc tương tự)

**Cần thêm**: VehicleSpecs class

```dart
class VehicleSpecs {
  final double loadCapacity;
  final TruckBedDimensions truckBedDimensions;

  VehicleSpecs({
    required this.loadCapacity,
    required this.truckBedDimensions,
  });

  factory VehicleSpecs.fromJson(Map<String, dynamic> json) {
    return VehicleSpecs(
      loadCapacity: (json['loadCapacity'] as num).toDouble(),
      truckBedDimensions: TruckBedDimensions.fromJson(
        json['truckBedDimensions'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'loadCapacity': loadCapacity,
      'truckBedDimensions': truckBedDimensions.toJson(),
    };
  }
}

class TruckBedDimensions {
  final double length;
  final double width;
  final double height;

  TruckBedDimensions({
    required this.length,
    required this.width,
    required this.height,
  });

  factory TruckBedDimensions.fromJson(Map<String, dynamic> json) {
    return TruckBedDimensions(
      length: (json['length'] as num).toDouble(),
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'length': length,
      'width': width,
      'height': height,
    };
  }
}

// Update Service model
class Service {
  final String id;
  final String name;
  final String description;
  final double basePrice;
  final String category;
  final VehicleSpecs? vehicleSpecs; // Add this
  // ... other fields

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      // ... other fields
      vehicleSpecs: json['vehicleSpecs'] != null
          ? VehicleSpecs.fromJson(json['vehicleSpecs'] as Map<String, dynamic>)
          : null,
    );
  }
}
```

### 7. App Name & Branding
**File**: `worker_app/android/app/src/main/AndroidManifest.xml` và `worker_app/ios/Runner/Info.plist`

**Cần xem xét**: Đổi tên app hoặc giữ nguyên

**Option 1**: Đổi tên thành "Thợ HCM - Thợ & Tài Xế"
**Option 2**: Giữ nguyên "Thợ HCM - Worker App"

---

## 📋 Checklist Cập Nhật

### Must Have (Bắt Buộc)
- [ ] Register screen: Role selection (worker/driver)
- [ ] Auth repository: Support dynamic role
- [ ] Auth provider: Generic register function
- [ ] Service edit: Vehicle specs fields
- [ ] Service edit: Category dropdown with driver restrictions
- [ ] Service model: VehicleSpecs class
- [ ] Services list: Display vehicle specs

### Nice to Have (Tùy chọn)
- [ ] Home screen: Role indicator badge
- [ ] Profile: Show role (Thợ/Tài xế)
- [ ] Service detail: Expandable vehicle specs card
- [ ] App icon: Update nếu cần
- [ ] Splash screen: Update branding

---

## 🧪 Testing Guide

### 1. Test Driver Registration
```
1. Mở app
2. Tap "Đăng ký"
3. Chọn "Tài xế" trong role selector
4. Điền thông tin
5. Submit
6. Verify trong backend: role = 'driver', status = 'pending'
```

### 2. Test Create Transportation Service
```
1. Driver đăng nhập (sau khi admin approve)
2. Mở "Dịch vụ" → "Tạo mới"
3. Category auto-lock hoặc chỉ cho chọn "Dịch Vụ Vận Chuyển"
4. Điền thông tin service
5. Điền vehicle specs (tất cả required):
   - Tải trọng: 1000
   - Dài: 2.5
   - Rộng: 1.6
   - Cao: 1.8
6. Submit
7. Verify service created với vehicleSpecs
```

### 3. Test Service Display
```
1. Mở danh sách services
2. Tìm service vận chuyển
3. Verify vehicle specs hiển thị: "🚚 1000kg • 2.5x1.6x1.8m"
4. Tap vào service
5. Verify detail screen hiển thị đầy đủ specs
```

### 4. Test Validation
```
1. Driver tạo service vận chuyển
2. Bỏ trống tải trọng → Should show error
3. Bỏ trống dimensions → Should show error
4. Nhập sai format (text thay vì số) → Should show error
```

---

## 📦 Dependencies Cần Thêm

Kiểm tra `pubspec.yaml`, có thể cần:

```yaml
dependencies:
  # Có thể cần nếu chưa có
  intl: ^0.18.0  # For number formatting
```

---

## 🎨 UI/UX Recommendations

### Role Selection Design
```
┌─────────────────────────────┐
│   Loại tài khoản           │
├─────────────────────────────┤
│ ┌───────┐  ┌───────┐       │
│ │ 👷 Thợ │  │🚗Tài xế│      │ ← SegmentedButton
│ └───────┘  └───────┘       │
│ Cung cấp dịch vụ sửa chữa  │ ← Helper text
└─────────────────────────────┘
```

### Vehicle Specs Card
```
┌─────────────────────────────┐
│ 🚚 Thông Tin Xe            │
├─────────────────────────────┤
│ Thông tin xe là bắt buộc   │
│ cho dịch vụ vận chuyển     │
│                             │
│ Tải trọng (kg) *           │
│ [________] ← 1000          │
│                             │
│ Kích thước thùng xe (mét)  │
│ [Dài] [Rộng] [Cao]        │
│ [2.5] [1.6]  [1.8]         │
└─────────────────────────────┘
```

### Service Card with Specs
```
┌─────────────────────────────┐
│ [Image]                     │
│ Vận chuyển hàng hóa        │
│ [Dịch Vụ Vận Chuyển]       │ ← Category chip
│ 🚚 1000kg • 2.5x1.6x1.8m   │ ← Vehicle specs
│ 200,000 VNĐ                │
│ [Sửa] [Xóa]                │
└─────────────────────────────┘
```

---

## 🚀 Deployment Steps

### 1. Code Changes
```bash
cd mobile/worker_app
# Make all changes above
```

### 2. Testing
```bash
# Run on emulator/device
flutter run

# Run tests (if any)
flutter test
```

### 3. Build
```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

### 4. Deploy
- Android: Upload to Google Play Console
- iOS: Upload to App Store Connect
- Or: Firebase App Distribution for beta testing

---

## 📝 Migration Notes

### Backward Compatibility
✅ **Không breaking changes** - Worker hiện tại vẫn hoạt động bình thường
- Existing workers không bị ảnh hưởng
- Chỉ thêm option mới cho driver
- API responses include optional vehicleSpecs

### Data Migration
❌ **Không cần migration** - Dữ liệu cũ vẫn valid
- Services cũ không có vehicleSpecs → null (OK)
- Users cũ role='worker' → không đổi

---

## 🆘 Common Issues & Solutions

### Issue 1: "Category null when driver creates service"
**Solution**: Mặc định category = 'Dịch Vụ Vận Chuyển' cho driver
```dart
_selectedCategory = _isDriver ? 'Dịch Vụ Vận Chuyển' : null;
```

### Issue 2: "Vehicle specs not saving"
**Solution**: Đảm bảo format đúng trong API call
```dart
'vehicleSpecs': {
  'loadCapacity': double.parse(...), // NOT string
  'truckBedDimensions': {
    'length': double.parse(...),
    'width': double.parse(...),
    'height': double.parse(...),
  }
}
```

### Issue 3: "Validation error: Kích thước thùng xe là bắt buộc"
**Solution**: Check tất cả 3 dimensions được điền
```dart
validator: (v) {
  if (_selectedCategory == 'Dịch Vụ Vận Chuyển' && 
      (v == null || v.isEmpty)) {
    return 'Bắt buộc cho dịch vụ vận chuyển';
  }
  return null;
}
```

---

## 🎯 Summary

### Files Cần Sửa
1. ✏️ `register_screen.dart` - Role selection
2. ✏️ `auth_repository.dart` - Generic register
3. ✏️ `auth_provider.dart` - Generic register
4. ✏️ `service_edit_screen.dart` - Vehicle specs form
5. ✏️ `services_screen.dart` - Display vehicle specs
6. ✏️ `service.dart` (model) - VehicleSpecs class

### Thời Gian Ước Tính
- **Development**: 4-6 hours
- **Testing**: 2-3 hours
- **Total**: ~1 working day

### Priority
- 🔴 **HIGH**: Register + Auth (để driver có thể đăng ký)
- 🟡 **MEDIUM**: Service edit + specs (để driver tạo service)
- 🟢 **LOW**: UI polish + UX improvements

---

**🚀 Sau khi cập nhật, driver có thể sử dụng đầy đủ app như worker!**

**Ngày tạo**: 2025-11-04  
**Version**: 1.0.0  
**Platform**: Flutter
