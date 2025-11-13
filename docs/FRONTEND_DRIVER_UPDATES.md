# Frontend Updates - Driver & Transportation Services

## Tổng Quan
Đã cập nhật giao diện web để hỗ trợ đầy đủ tính năng tài xế và dịch vụ vận chuyển.

## 🎨 Các Component Đã Cập Nhật

### 1. Register.jsx - Đăng Ký Tài Khoản
**Thay đổi**: Từ checkbox đơn giản thành radio buttons để chọn role

**Tính năng mới**:
- ✅ Radio button chọn role: Customer / Worker / Driver
- ✅ Icon riêng cho từng role (Person/Build/LocalShipping)
- ✅ Mô tả rõ ràng cho từng loại tài khoản
- ✅ Alert thông báo cần admin duyệt cho Worker/Driver

**UI/UX**:
```jsx
<RadioGroup value={role}>
  <FormControlLabel value="customer" 
    label={<CustomerIcon /> Khách hàng} />
  <FormControlLabel value="worker" 
    label={<WorkerIcon /> Thợ (Sửa chữa)} />
  <FormControlLabel value="driver" 
    label={<TruckIcon /> Tài xế (Vận chuyển)} />
</RadioGroup>
```

### 2. ServiceDetail.jsx - Chi Tiết Dịch Vụ
**Thay đổi**: Hiển thị thông tin xe cho dịch vụ vận chuyển

**Tính năng mới**:
- ✅ Badge category với màu riêng cho "Dịch Vụ Vận Chuyển"
- ✅ Card thông tin xe (chỉ hiện với dịch vụ vận chuyển)
- ✅ Hiển thị tải trọng và kích thước thùng xe

**Vehicle Specs Display**:
```jsx
{service.category === 'Dịch Vụ Vận Chuyển' && service.vehicleSpecs && (
  <div className="vehicle-info-card">
    <h3>🚚 Thông Tin Xe</h3>
    <div className="specs-grid">
      <div>Tải trọng: {loadCapacity} kg</div>
      <div>Chiều dài: {length} m</div>
      <div>Chiều rộng: {width} m</div>
      <div>Chiều cao: {height} m</div>
    </div>
  </div>
)}
```

**Styling**:
- Background: `#f8f9fa`
- Border: `1px solid #e0e0e0`
- Grid layout responsive

### 3. Home.jsx - Trang Chủ
**Thay đổi**: Service cards hiển thị vehicle specs

**Tính năng mới**:
- ✅ Chip hiển thị category
- ✅ Vehicle specs chips cho dịch vụ vận chuyển
- ✅ Format: `🚚 1000 kg` và `📦 2.5x1.6x1.8m`

**Service Card Layout**:
```
┌─────────────────────┐
│   [Service Image]   │
├─────────────────────┤
│ Service Name        │
│ Thợ: Name           │
│ [Category Chip]     │
│ 🚚 1000kg 📦 2.5x1.6│ ← Vehicle specs (nếu có)
│ ⭐⭐⭐⭐⭐ (15)     │
│ 200,000 VNĐ         │
│ [Xem] [Đặt lịch]    │
└─────────────────────┘
```

### 4. ServiceForm.jsx - Component Mới
**Mục đích**: Tạo và chỉnh sửa dịch vụ cho Worker/Driver

**Tính năng**:
- ✅ Form đầy đủ cho service creation/editing
- ✅ Category dropdown
- ✅ Collapsible vehicle specs section
- ✅ Validation cho vehicle specs (bắt buộc với vận chuyển)
- ✅ Auto-lock category "Dịch Vụ Vận Chuyển" cho driver

**Form Fields**:
```jsx
- Tên dịch vụ (required)
- Mô tả (multiline)
- Giá cơ bản (number, required)
- Category (select, disabled for drivers)
- Giảm giá % (number, 0-100)

// Chỉ hiện khi category = 'Dịch Vụ Vận Chuyển'
- Tải trọng (kg) (required)
- Chiều dài thùng (m) (required)
- Chiều rộng thùng (m) (required)
- Chiều cao thùng (m) (required)
```

**Validation Logic**:
```javascript
if (category === 'Dịch Vụ Vận Chuyển') {
  if (!loadCapacity) error = 'Tải trọng bắt buộc'
  if (!length || !width || !height) error = 'Kích thước bắt buộc'
}
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 600px - Stack vertically
- Tablet: 600-960px - 2 columns
- Desktop: > 960px - 3-4 columns

### Vehicle Specs Display
```css
/* Mobile */
.specs-grid {
  grid-template-columns: 1fr;
}

/* Desktop */
.specs-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

## 🎨 Design System

### Colors
- **Transportation Service**: 
  - Background: `#e3f2fd` (light blue)
  - Text: `#1976d2` (primary blue)
- **Regular Service**: 
  - Background: `#f5f5f5` (grey)
  - Text: `#666`

### Icons
- 🚚 Tải trọng
- 📦 Kích thước
- 👷 Thợ
- 🚗 Tài xế
- 👤 Khách hàng

### Chips & Badges
```jsx
<Chip 
  label="Dịch Vụ Vận Chuyển"
  color="primary"
  size="small"
/>

<Chip 
  label="🚚 1000 kg"
  variant="outlined"
  size="small"
/>
```

## 🔄 Integration với Backend

### API Calls

#### 1. Register with Role
```javascript
POST /api/users/register
{
  name: "Nguyễn Văn A",
  phone: "0901234567",
  password: "password123",
  role: "driver", // customer, worker, driver
  address: "..."
}
```

#### 2. Create Service with Vehicle Specs
```javascript
POST /api/services
{
  name: "Vận chuyển hàng hóa",
  description: "...",
  basePrice: 200000,
  category: "Dịch Vụ Vận Chuyển",
  vehicleSpecs: {
    loadCapacity: 1000,
    truckBedDimensions: {
      length: 2.5,
      width: 1.6,
      height: 1.8
    }
  }
}
```

#### 3. Get Services (includes vehicle specs)
```javascript
GET /api/services
Response: [
  {
    _id: "...",
    name: "...",
    category: "Dịch Vụ Vận Chuyển",
    vehicleSpecs: {
      loadCapacity: 1000,
      truckBedDimensions: { length: 2.5, width: 1.6, height: 1.8 }
    },
    ...
  }
]
```

## 🚀 User Flows

### Flow 1: Driver Registration
```
1. User mở /register
2. Chọn role "Tài xế"
3. Nhập thông tin (name, phone, password, address)
4. Submit → Status: "pending"
5. Chờ admin duyệt
```

### Flow 2: Create Transportation Service
```
1. Driver đăng nhập
2. Mở ServiceForm component
3. Category auto-set: "Dịch Vụ Vận Chuyển"
4. Nhập thông tin service
5. Nhập vehicle specs (bắt buộc):
   - Tải trọng
   - Kích thước thùng xe
6. Submit → Service created
```

### Flow 3: Customer Booking Transportation
```
1. Customer xem service list
2. Thấy service có badge "Dịch Vụ Vận Chuyển"
3. Thấy vehicle specs: 🚚 1000kg 📦 2.5x1.6x1.8m
4. Click "Xem chi tiết"
5. Xem đầy đủ thông tin xe
6. Click "Đặt lịch"
```

## 📋 TODO - Tính năng nâng cao

### Filter/Search
- [ ] Filter theo tải trọng (slider: 0-5000kg)
- [ ] Filter theo kích thước thùng
- [ ] Filter theo category
- [ ] Combine filters

**Ví dụ UI**:
```jsx
<Box sx={{ mb: 3 }}>
  <Select label="Category">
    <MenuItem value="all">Tất cả</MenuItem>
    <MenuItem value="Dịch Vụ Vận Chuyển">Vận chuyển</MenuItem>
    <MenuItem value="Điện Lạnh">Điện Lạnh</MenuItem>
  </Select>
  
  {/* Chỉ hiện khi category = Vận chuyển */}
  <Box>
    <Typography>Tải trọng</Typography>
    <Slider 
      min={0} 
      max={5000} 
      step={100}
      marks={[
        { value: 0, label: '0kg' },
        { value: 1000, label: '1 tấn' },
        { value: 3000, label: '3 tấn' },
        { value: 5000, label: '5 tấn' }
      ]}
    />
  </Box>
</Box>
```

### Advanced Service Display
- [ ] Map view cho driver location
- [ ] Availability calendar
- [ ] Real-time truck tracking
- [ ] Photo gallery of actual truck

### Admin Dashboard
- [ ] Driver management table
- [ ] Vehicle specs verification
- [ ] Statistics: drivers, transportation bookings
- [ ] Revenue by category

## 🧪 Testing Checklist

### Registration Flow
- [ ] Customer registration works
- [ ] Worker registration shows approval alert
- [ ] Driver registration shows approval alert
- [ ] Role icons display correctly
- [ ] Form validation works

### Service Display
- [ ] Transportation services show vehicle specs
- [ ] Non-transportation services don't show vehicle specs
- [ ] Category chips have correct colors
- [ ] Vehicle specs format correctly on mobile
- [ ] Vehicle specs format correctly on desktop

### Service Creation (Driver)
- [ ] ServiceForm opens
- [ ] Category locked to "Dịch Vụ Vận Chuyển"
- [ ] Vehicle specs fields show
- [ ] Validation works (all fields required)
- [ ] Submit creates service successfully
- [ ] Error messages display correctly

### Service Editing
- [ ] Can edit existing service
- [ ] Vehicle specs pre-fill correctly
- [ ] Can update vehicle specs
- [ ] Changes save successfully

## 🔧 Development Notes

### Component Structure
```
/src
  /pages
    Register.jsx ✅ Updated
    Home.jsx ✅ Updated
    ServiceDetail.jsx ✅ Updated
  /components
    ServiceForm.jsx ✅ New
    ServiceMediaGallery.jsx (existing)
    ReviewSection.jsx (existing)
```

### Import Dependencies
```javascript
// Material-UI Icons
import { 
  LocalShipping as TruckIcon,
  Build as WorkerIcon,
  Person as CustomerIcon 
} from '@mui/icons-material'

// Material-UI Components
import { 
  Chip, 
  Radio, 
  RadioGroup,
  Collapse,
  Grid 
} from '@mui/material'
```

### State Management
```javascript
// Service state includes vehicle specs
const [service, setService] = useState({
  name: '',
  description: '',
  category: '',
  vehicleSpecs: {
    loadCapacity: null,
    truckBedDimensions: {
      length: null,
      width: null,
      height: null
    }
  }
})
```

## 📖 Usage Examples

### Using ServiceForm Component
```jsx
import ServiceForm from '../components/ServiceForm'

function MyServicesPage() {
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  
  const handleSuccess = () => {
    // Reload services list
    loadServices()
  }
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Tạo dịch vụ mới
      </Button>
      
      <ServiceForm
        open={open}
        onClose={() => setOpen(false)}
        service={selectedService}
        onSuccess={handleSuccess}
      />
    </>
  )
}
```

### Displaying Vehicle Specs
```jsx
{service.vehicleSpecs && (
  <Box className="vehicle-specs">
    <Typography variant="h6">🚚 Thông Tin Xe</Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="caption">Tải trọng</Typography>
        <Typography variant="body1">
          {service.vehicleSpecs.loadCapacity.toLocaleString()} kg
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="caption">Kích thước</Typography>
        <Typography variant="body1">
          {service.vehicleSpecs.truckBedDimensions.length} x{' '}
          {service.vehicleSpecs.truckBedDimensions.width} x{' '}
          {service.vehicleSpecs.truckBedDimensions.height} m
        </Typography>
      </Grid>
    </Grid>
  </Box>
)}
```

---
**Ngày cập nhật**: 2025-11-04  
**Version**: 1.0.0  
**Framework**: React 18 + Material-UI + Vite  
**Tác giả**: Cascade AI Assistant
