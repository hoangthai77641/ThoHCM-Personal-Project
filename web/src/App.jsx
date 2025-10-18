import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Users from './pages/Users'
import ServiceDetail from './pages/ServiceDetail'
import BannerManagement from './pages/BannerManagement'
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";

import SearchBox from './components/SearchBox'
import NotificationSystem from './components/NotificationSystem'
import logo from './assets/logo.png'
import api from './api'


function AppContent() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Fetch fresh user data on mount to ensure avatar is up-to-date
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token || !user) return
      
      try {
        const response = await api.get('/api/users/me')
        const freshUser = response.data
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
        
        console.log('Fresh user data loaded:', freshUser)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // If token is invalid, logout
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    }
    
    fetchUserProfile()
  }, []) // Only run once on mount
  
  // Debug: Log user object to see avatar path
  useEffect(() => {
    if (user) {
      console.log('User object:', user)
      console.log('Avatar path:', user.avatar)
      if (user.avatar) {
        const avatarUrl = user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`
        console.log('Full avatar URL:', avatarUrl)
      }
    }
  }, [user])
  
  // Listen for user data changes (e.g., avatar updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(updatedUser)
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector('.user-dropdown-menu');
      const button = document.querySelector('.user-menu-btn');
      if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove('show');
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [])
  
  const logout = () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return
    // optional: call backend logout if you implement one
    try {
      const token = localStorage.getItem('token')
      if (token) fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'worker')
  
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="brand">
          <img src={logo} alt="Logo" className="brand-logo" />
          <span>Thợ HCM</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {!user && <Link to="/register">Đăng ký</Link>}
          {!user && <Link to="/login">Đăng nhập</Link>}
          
          {isAdmin && <>
            <Link to="/admin">Bảng điều khiển</Link>
            {user?.role === 'admin' && <Link to="/users">Người dùng</Link>}
            {user?.role === 'admin' && <Link to="/banners">Banner & Thông báo</Link>}
          </>}
          <SearchBox />
          <span className="spacer" />
          {user && <NotificationSystem user={user} />}
          <button 
            className="btn theme-toggle-btn" 
            onClick={()=>{
              const current = document.documentElement.getAttribute('data-theme');
              const next = current === 'light' ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', next);
            }}
            title="Chuyển đổi giao diện"
            aria-label="Toggle theme"
          >
            <svg className="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg className="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
          {user && (
            <div className="user-menu-wrapper">
              <button className="btn user-menu-btn" onClick={() => {
                const menu = document.querySelector('.user-dropdown-menu');
                menu.classList.toggle('show');
              }}>
                {user.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`} 
                    alt={user.name}
                    className="user-avatar-small"
                    onError={(e) => { 
                      console.error('Avatar failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      // Show placeholder instead
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder && placeholder.classList.contains('user-avatar-placeholder')) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="user-avatar-placeholder" style={{ display: user.avatar ? 'none' : 'flex' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-text">{user.name}</span>
              </button>
              <div className="user-dropdown-menu">
                {user.role === 'customer' && (
                  <Link to="/my-bookings" onClick={() => {
                    document.querySelector('.user-dropdown-menu').classList.remove('show');
                  }}>Đơn của tôi</Link>
                )}
                <Link to="/profile" onClick={() => {
                  document.querySelector('.user-dropdown-menu').classList.remove('show');
                }}>Thông tin cá nhân</Link>
                <button className="dropdown-item" onClick={logout}>Đăng xuất</button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="nav-mobile-search">
          <SearchBox />
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`nav-mobile ${mobileMenuOpen ? 'open' : ''}`}>
          {!user && <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>}
          {!user && <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>}
          
          {isAdmin && <>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Bảng điều khiển</Link>
            {user?.role === 'admin' && <Link to="/users" onClick={() => setMobileMenuOpen(false)}>Người dùng</Link>}
            {user?.role === 'admin' && <Link to="/banners" onClick={() => setMobileMenuOpen(false)}>Banner & Thông báo</Link>}
          </>}
          <button 
            className="btn theme-toggle-btn" 
            onClick={()=>{
              const current = document.documentElement.getAttribute('data-theme');
              const next = current === 'light' ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', next);
              setMobileMenuOpen(false);
            }}
            title="Chuyển đổi giao diện"
          >
            <svg className="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg className="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span className="theme-text">Giao diện</span>
          </button>
          {user && (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                {user.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`} 
                    alt={user.name}
                    className="user-avatar-small"
                    onError={(e) => { 
                      console.error('Mobile avatar failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder && placeholder.classList.contains('user-avatar-placeholder')) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="user-avatar-placeholder" style={{ display: user.avatar ? 'none' : 'flex' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </div>
              {user.role === 'customer' && (
                <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>Đơn của tôi</Link>
              )}
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Thông tin cá nhân</Link>
              <button className="btn" onClick={() => {logout(); setMobileMenuOpen(false);}}>Đăng xuất</button>
            </div>
          )}
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/service/:id" element={<ServiceDetail/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/verify-otp" element={<OTPVerification/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/booking" element={<Booking/>} />
          <Route path="/my-bookings" element={<MyBookings/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/users" element={<Users/>} />
          <Route path="/banners" element={<BannerManagement/>} />

        </Routes>
      </main>
      <footer className="footer">
        <div>
          <p>&copy; 2025 Thợ HCM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
