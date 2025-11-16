# 📱 Hướng Dẫn Responsive Design với Tailwind CSS

## 🎯 Breakpoints của Tailwind CSS

Tailwind sử dụng mobile-first approach:

```
sm:  640px   - Tablet nhỏ
md:  768px   - Tablet
lg:  1024px  - Laptop nhỏ
xl:  1280px  - Desktop
2xl: 1536px  - Desktop lớn
```

## 📐 Cách Sử Dụng

### 1. **Mobile First Approach**
```jsx
// Default styles cho mobile, sau đó thêm breakpoints
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width trên mobile, 50% trên tablet, 33% trên desktop */}
</div>
```

### 2. **Responsive Grid Layout**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

### 3. **Responsive Flexbox**
```jsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Column trên mobile, Row trên tablet+ */}
</div>
```

### 4. **Responsive Text Size**
```jsx
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### 5. **Hide/Show Elements**
```jsx
{/* Ẩn trên mobile, hiện trên desktop */}
<div className="hidden md:block">Desktop Only</div>

{/* Hiện trên mobile, ẩn trên desktop */}
<div className="block md:hidden">Mobile Only</div>
```

### 6. **Responsive Padding/Margin**
```jsx
<div className="p-4 md:p-6 lg:p-8">
  {/* 16px mobile, 24px tablet, 32px desktop */}
</div>
```

## 🎨 Component Examples

### ✅ Responsive Card
```jsx
function ServiceCard({ service }) {
  return (
    <div className="bg-white rounded-lg shadow-card p-4 md:p-6 
                    hover:shadow-lg transition-shadow">
      <img 
        src={service.image} 
        alt={service.name}
        className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg md:text-xl font-bold mb-2">
        {service.name}
      </h3>
      <p className="text-sm md:text-base text-gray-600">
        {service.description}
      </p>
    </div>
  );
}
```

### ✅ Responsive Navigation
```jsx
function Navigation() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Logo />
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/services">Dịch vụ</NavLink>
            <NavLink to="/booking">Đặt lịch</NavLink>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}
```

### ✅ Responsive Form
```jsx
function BookingForm() {
  return (
    <form className="space-y-4 md:space-y-6">
      {/* 2 columns trên desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="Họ tên"
          className="w-full px-4 py-2 md:py-3 rounded-lg border"
        />
        <input 
          type="tel" 
          placeholder="Số điện thoại"
          className="w-full px-4 py-2 md:py-3 rounded-lg border"
        />
      </div>
      
      <button className="w-full md:w-auto px-6 py-2 md:py-3 
                         bg-primary-500 text-white rounded-lg">
        Đặt lịch ngay
      </button>
    </form>
  );
}
```

### ✅ Responsive Dashboard
```jsx
function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng đơn" value="150" />
        <StatCard title="Hoàn thành" value="120" />
        <StatCard title="Đang xử lý" value="25" />
        <StatCard title="Hủy" value="5" />
      </div>
      
      {/* Main Content - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
        <div>
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Utility Classes Hay Dùng

### Container & Spacing
```jsx
container mx-auto        // Centered container
px-4 md:px-6 lg:px-8    // Responsive padding
space-y-4 md:space-y-6  // Vertical spacing
gap-4 md:gap-6          // Grid/Flex gap
```

### Width & Height
```jsx
w-full                  // 100% width
w-screen                // 100vw
h-screen                // 100vh
min-h-screen            // Min height 100vh
max-w-7xl mx-auto       // Max width với center
```

### Display & Position
```jsx
flex items-center justify-between
grid place-items-center
absolute inset-0
sticky top-0
```

### Typography
```jsx
text-sm md:text-base lg:text-lg
font-bold
text-center md:text-left
truncate                // Text ellipsis
line-clamp-2            // Multi-line ellipsis
```

## 🎭 Dark Mode Support

Tailwind đã được cấu hình với `darkMode: 'class'`:

```jsx
<div className="bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white">
  Content với dark mode support
</div>
```

Toggle dark mode trong React:
```jsx
// Thêm/xóa class 'dark' vào <html> element
document.documentElement.classList.toggle('dark');
```

## 📊 Performance Tips

1. **Chỉ import những gì cần** - Tailwind tự động purge unused styles
2. **Sử dụng @apply cho repeated patterns** trong CSS
3. **Combine với CSS variables** cho dynamic theming

## 🔄 Migration Plan

### Phase 1: New Components
- Tất cả component mới dùng Tailwind

### Phase 2: Refactor Existing
- Dần dần chuyển CSS thuần sang Tailwind
- Giữ CSS variables cho compatibility

### Phase 3: Optimization
- Remove unused CSS
- Optimize bundle size

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/) - Unstyled components
- [Heroicons](https://heroicons.com/) - Beautiful icons

---

**Lưu ý**: CSS variables hiện tại (`--primary`, `--bg`, v.v.) vẫn hoạt động bình thường và có thể dùng cùng Tailwind!
