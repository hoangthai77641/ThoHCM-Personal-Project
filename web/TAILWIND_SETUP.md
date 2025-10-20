# 🎨 Tailwind CSS Setup Guide

## ✅ Đã hoàn thành cài đặt

### 📦 Packages đã cài
```json
{
  "devDependencies": {
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x"
  }
}
```

### ⚙️ Files cấu hình

1. **`tailwind.config.js`** - Cấu hình Tailwind CSS
   - Dark mode support: `class` based
   - Custom colors: primary palette
   - Extended theme với custom shadows và border-radius

2. **`postcss.config.js`** - Cấu hình PostCSS
   - Tailwind CSS plugin
   - Autoprefixer plugin

3. **`src/styles.css`** - CSS chính
   - ✅ Đã thêm `@tailwind` directives
   - ✅ Giữ nguyên CSS variables cũ

4. **`src/styles/responsive.css`** - Custom responsive utilities
   - Component classes (`card-responsive`, `btn-responsive`, etc.)
   - Grid layouts
   - Typography scale
   - Animation utilities

## 🚀 Cách sử dụng

### 1. Chạy development server
```bash
npm run dev
```

Tailwind sẽ tự động compile CSS khi bạn sử dụng classes trong JSX.

### 2. Build production
```bash
npm run build
```

Tailwind sẽ tự động purge unused CSS để optimize bundle size.

## 📝 Examples

### Basic Responsive Component

```jsx
function MyComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Responsive heading */}
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6">
        Welcome
      </h1>
      
      {/* Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-card p-6">
          Card 1
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          Card 2
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          Card 3
        </div>
      </div>
    </div>
  );
}
```

### Using Custom Classes

```jsx
function ServiceCard() {
  return (
    <div className="card-responsive">
      <h3 className="heading-3">Service Title</h3>
      <p className="text-responsive">Description</p>
      <button className="btn-responsive btn-primary">
        Book Now
      </button>
    </div>
  );
}
```

### Dark Mode Toggle

```jsx
function DarkModeToggle() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <button 
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      Toggle Dark Mode
    </button>
  );
}
```

## 🎯 Migration Strategy

### Phase 1: New Components (Current)
- ✅ Tất cả component mới dùng Tailwind
- ✅ File examples: `src/components/ResponsiveExamples.jsx`

### Phase 2: Refactor Existing Components
Từ từ chuyển đổi components hiện có:

**Before:**
```jsx
<div className="service-card" style={{padding: '24px'}}>
  <h3 className="service-title">Title</h3>
</div>
```

**After:**
```jsx
<div className="bg-white rounded-lg shadow-card p-6">
  <h3 className="text-xl font-bold">Title</h3>
</div>
```

### Phase 3: Cleanup
- Remove unused CSS từ `styles.css`
- Keep CSS variables cho compatibility
- Optimize Tailwind config

## 📚 Resources

### Official Docs
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Complete documentation
- [Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoints guide
- [Dark Mode](https://tailwindcss.com/docs/dark-mode) - Dark mode setup

### Components & Templates
- [Tailwind UI](https://tailwindui.com/) - Official components (paid)
- [Headless UI](https://headlessui.com/) - Unstyled components
- [DaisyUI](https://daisyui.com/) - Component library
- [Flowbite](https://flowbite.com/) - Free components

### Tools
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VSCode extension
- [Prettier Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) - Auto-sort classes

## 🐛 Troubleshooting

### CSS không compile
```bash
# Clear cache và rebuild
rm -rf node_modules/.vite
npm run dev
```

### Classes không apply
- Kiểm tra `tailwind.config.js` content paths
- Đảm bảo file có extension `.jsx` hoặc `.tsx`
- Restart dev server

### Dark mode không hoạt động
```jsx
// Thêm class 'dark' vào <html>
document.documentElement.classList.add('dark');

// Hoặc toggle
document.documentElement.classList.toggle('dark');
```

### Purge xóa classes cần thiết
Thêm vào `tailwind.config.js`:
```js
module.exports = {
  safelist: [
    'bg-red-500',
    'text-3xl',
    // classes cần giữ
  ]
}
```

## 💡 Pro Tips

### 1. Sử dụng @apply cho repeated patterns
```css
.btn-custom {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600;
}
```

### 2. Custom utilities trong config
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      }
    }
  }
}
```

### 3. VSCode IntelliSense
Cài extension "Tailwind CSS IntelliSense" để có autocomplete.

### 4. Class ordering
Cài Prettier plugin để tự động sắp xếp classes:
```bash
npm install -D prettier prettier-plugin-tailwindcss
```

## 🎨 Design System

### Colors
```jsx
// Primary colors
bg-primary-500     // Main brand color
bg-primary-600     // Hover state
bg-primary-50      // Light background

// Text colors
text-gray-900      // Primary text
text-gray-600      // Secondary text
text-gray-400      // Muted text
```

### Spacing Scale
```
p-4    = 16px
p-6    = 24px
p-8    = 32px
p-12   = 48px
```

### Typography
```jsx
text-sm      // 14px
text-base    // 16px
text-lg      // 18px
text-xl      // 20px
text-2xl     // 24px
```

## 🔄 Next Steps

1. ✅ Tailwind CSS installed
2. ✅ Config files created
3. ✅ Example components created
4. ✅ Responsive utilities added
5. 🔲 Migrate existing components
6. 🔲 Add custom plugins if needed
7. 🔲 Optimize for production

## 📞 Support

Nếu có vấn đề, check:
1. File `RESPONSIVE_DESIGN_GUIDE.md` - Chi tiết về responsive design
2. File `src/components/ResponsiveExamples.jsx` - Component examples
3. [Tailwind CSS Discord](https://tailwindcss.com/discord) - Community support

---

**Happy Coding! 🚀**
