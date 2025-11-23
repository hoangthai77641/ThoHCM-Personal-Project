import React from 'react';

/**
 * Component mẫu để demo Responsive Design với Tailwind CSS
 * Có thể sử dụng component này làm reference
 */

export function ResponsiveCard({ title, description, image, price, rating }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-lg 
                    transition-all duration-300 overflow-hidden">
      {/* Image Container - Responsive height */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {rating && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 
                          px-2 py-1 rounded-lg text-sm font-bold">
            ⭐ {rating}
          </div>
        )}
      </div>
      
      {/* Content - Responsive padding */}
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 
                       text-gray-900 dark:text-white truncate">
          {title}
        </h3>
        
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 
                      mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Footer - Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xl md:text-2xl font-bold text-primary-500">
            {price ? `${price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </div>
          
          <button className="w-full sm:w-auto px-4 py-2 bg-primary-500 
                           hover:bg-primary-600 text-white rounded-lg 
                           transition-colors text-sm md:text-base font-medium">
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
                    gap-4 md:gap-6 lg:gap-8">
      {children}
    </div>
  );
}

export function ResponsiveContainer({ children, className = '' }) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold text-primary-500">
              ThoHCM
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 
                                   transition-colors">
              Trang chủ
            </a>
            <a href="/services" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 
                                           transition-colors">
              Dịch vụ
            </a>
            <a href="/booking" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 
                                          transition-colors">
              Đặt lịch
            </a>
            <a href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 
                                          transition-colors">
              Tài khoản
            </a>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t dark:border-gray-700">
            <a href="/" className="block py-2 text-gray-700 dark:text-gray-300 
                                   hover:text-primary-500 transition-colors">
              Trang chủ
            </a>
            <a href="/services" className="block py-2 text-gray-700 dark:text-gray-300 
                                           hover:text-primary-500 transition-colors">
              Dịch vụ
            </a>
            <a href="/booking" className="block py-2 text-gray-700 dark:text-gray-300 
                                          hover:text-primary-500 transition-colors">
              Đặt lịch
            </a>
            <a href="/profile" className="block py-2 text-gray-700 dark:text-gray-300 
                                          hover:text-primary-500 transition-colors">
              Tài khoản
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

export function ResponsiveHero() {
  return (
    <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 
                    text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 
                      py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                           font-bold mb-4 md:mb-6">
              Tìm thợ chuyên nghiệp
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 
                          text-primary-50">
              Nhanh chóng - Uy tín - Chất lượng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-6 py-3 md:px-8 md:py-4 bg-white text-primary-500 
                               rounded-lg font-bold hover:bg-gray-100 transition-colors
                               text-base md:text-lg">
                Đặt lịch ngay
              </button>
              <button className="px-6 py-3 md:px-8 md:py-4 border-2 border-white 
                               rounded-lg font-bold hover:bg-white hover:text-primary-500 
                               transition-colors text-base md:text-lg">
                Xem dịch vụ
              </button>
            </div>
          </div>
          
          {/* Image - Hidden on mobile */}
          <div className="hidden lg:block flex-1">
            <img 
              src="/hero-image.png" 
              alt="Hero"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResponsiveStatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl md:text-3xl">{icon}</div>
        {trend && (
          <span className={`text-xs md:text-sm font-bold px-2 py-1 rounded 
                          ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 
                      text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
        {title}
      </div>
    </div>
  );
}

// Example Usage Component
export function ResponsiveExample() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveNavbar />
      
      <ResponsiveHero />
      
      <ResponsiveContainer className="py-8 md:py-12 lg:py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <ResponsiveStatCard title="Tổng đơn" value="1,234" icon="📦" trend={12} />
          <ResponsiveStatCard title="Hoàn thành" value="1,100" icon="✅" trend={8} />
          <ResponsiveStatCard title="Thợ" value="450" icon="👷" trend={15} />
          <ResponsiveStatCard title="Đánh giá" value="4.8⭐" icon="⭐" trend={5} />
        </div>
        
        {/* Services Grid */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 
                       text-gray-900 dark:text-white">
          Dịch vụ nổi bật
        </h2>
        
        <ResponsiveGrid>
          <ResponsiveCard 
            title="Sửa điện nước"
            description="Dịch vụ sửa chữa điện nước chuyên nghiệp, nhanh chóng"
            image="/service-1.jpg"
            price={200000}
            rating={4.8}
          />
          <ResponsiveCard 
            title="Sơn nhà"
            description="Thi công sơn nhà đẹp, bền, giá cả hợp lý"
            image="/service-2.jpg"
            price={500000}
            rating={4.9}
          />
          <ResponsiveCard 
            title="Vệ sinh máy lạnh"
            description="Vệ sinh, bảo dưỡng máy lạnh định kỳ"
            image="/service-3.jpg"
            price={150000}
            rating={4.7}
          />
        </ResponsiveGrid>
      </ResponsiveContainer>
    </div>
  );
}
