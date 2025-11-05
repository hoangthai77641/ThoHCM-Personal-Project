import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Users from './pages/Users'
import AdministratorManagement from './pages/AdministratorManagement'
import ServiceDetail from './pages/ServiceDetail'
import BannerManagement from './pages/BannerManagement'
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import NearbyWorkers from "./pages/NearbyWorkers";
import TransportServices from "./pages/TransportServices";

import ResponsiveNav from './components/ResponsiveNav'
import api from './api'


function AppContent() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  
  // Fetch fresh user data on mount to ensure avatar is up-to-date
  useEffect(() => {
    // Use refs to avoid multiple concurrent fetches which could trigger rate limits
    let isMounted = true
    const isFetchingRef = { current: false }
    const lastFetchRef = { current: 0 }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // Throttle: skip if a fetch is in progress or we've fetched recently
        const now = Date.now()
        if (isFetchingRef.current) return
        if (now - lastFetchRef.current < 3000) return // 3s throttle

        isFetchingRef.current = true
        lastFetchRef.current = now

        const response = await api.get('/api/users/me')
        const freshUser = response.data

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUser))
        if (isMounted) setUser(freshUser)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // If token is invalid, logout
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (isMounted) setUser(null)
        }
        // If rate limited (429), avoid retrying aggressively
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after']
          const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000
          // schedule a delayed attempt (no UI blocking)
          setTimeout(() => {
            // only attempt if token still exists
            if (localStorage.getItem('token')) fetchUserProfile()
          }, wait)
        }
      } finally {
        isFetchingRef.current = false
      }
    }

    // Fetch once on mount if there's a token (user may be null when page first loads)
    fetchUserProfile()

    return () => { isMounted = false }
  }, [])
  
  // Listen for user data changes (e.g., avatar updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(updatedUser)
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Listen to custom authChanged event dispatched in the same tab (localStorage events don't fire in same tab)
    const handleAuthChanged = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(updatedUser)
      // try to refresh profile too
      (async () => {
        try {
          const token = localStorage.getItem('token')
          if (!token) return
          const response = await api.get('/api/users/me')
          const freshUser = response.data
          localStorage.setItem('user', JSON.stringify(freshUser))
          setUser(freshUser)
        } catch (e) {
          // ignore
        }
      })()
    }
    window.addEventListener('authChanged', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [])
  
  const logout = () => {
    // Call backend logout if implemented
    try {
      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ResponsiveNav user={user} onLogout={logout} />
      
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/service/:id" element={<ServiceDetail/>} />
            <Route path="/transport-services" element={<TransportServices/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route path="/verify-otp" element={<OTPVerification/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/booking" element={<Booking/>} />
            <Route path="/my-bookings" element={<MyBookings/>} />
            <Route path="/nearby-workers" element={<NearbyWorkers/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/admin" element={<AdminDashboard/>} />
            <Route path="/users" element={<Users/>} />
            <Route path="/administrators" element={<AdministratorManagement/>} />
            <Route path="/banners" element={<BannerManagement/>} />
          </Routes>
        </Container>
      </Box>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ color: 'text.secondary' }}>
            &copy; 2025 Thợ HCM. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default function App() {
  return <AppContent />
}
