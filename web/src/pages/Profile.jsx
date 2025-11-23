import React, { useState, useEffect } from 'react'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../config/messages'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: null,
    stats: {
      totalBookings: 0,
      completedBookings: 0,
      totalSpent: 0,
      loyaltyLevel: 'normal',
      serviceStats: {}
    }
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [navigate])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        avatar: response.data.avatar || null,
        stats: response.data.stats || {
          totalBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          loyaltyLevel: 'normal',
          serviceStats: {}
        }
      })
      setLoading(false)
    } catch (error) {
      setMsg('Lỗi khi tải thông tin: ' + (error.response?.data?.message || error.message))
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMsg(null)
    
    try {
      const token = localStorage.getItem('token')
      await api.put('/api/users/me', {
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.name = profile.name
      localStorage.setItem('user', JSON.stringify(user))
      
      setMsg('Cập nhật thông tin thành công!')
      setUpdating(false)
    } catch (error) {
      setMsg('Lỗi cập nhật: ' + (error.response?.data?.message || error.message))
      setUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMsg('Mật khẩu xác nhận không khớp')
      return
    }
    
    if (passwords.newPassword.length < 6) {
      setMsg(UI_MESSAGES.FORMS.PASSWORD_MIN_LENGTH)
      return
    }
    
    setUpdating(true)
    
    try {
      const token = localStorage.getItem('token')
      await api.put('/api/users/me', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMsg('Đổi mật khẩu thành công!')
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordChange(false)
      setUpdating(false)
    } catch (error) {
      setMsg('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || error.message))
      setUpdating(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setMsg('Chỉ chấp nhận file ảnh JPEG, PNG, WebP')
        return
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMsg('Kích thước ảnh không được vượt quá 2MB')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Upload immediately
      uploadAvatar(file)
    }
  }

  const uploadAvatar = async (file) => {
    setUploadingAvatar(true)
    setMsg(null)
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      console.log('Uploading avatar:', file.name, file.size)
      
      const response = await api.post('/api/users/avatar', formData)
      
      console.log('Upload response:', response.data)
      
      setProfile(prev => ({ ...prev, avatar: response.data.user.avatar }))
      setAvatarPreview(null)
      setMsg('Cập nhật ảnh đại diện thành công!')
      
      // Update localStorage to reflect new avatar
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (currentUser) {
        currentUser.avatar = response.data.user.avatar
        localStorage.setItem('user', JSON.stringify(currentUser))
        // Trigger re-render by dispatching a custom event
        window.dispatchEvent(new Event('storage'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setMsg('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message))
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const deleteAvatar = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return
    
    setUploadingAvatar(true)
    setMsg(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await api.delete('/api/users/avatar', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProfile(prev => ({ ...prev, avatar: null }))
      setMsg('Đã xóa ảnh đại diện!')
      
      // Update localStorage to remove avatar
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (currentUser) {
        delete currentUser.avatar
        localStorage.setItem('user', JSON.stringify(currentUser))
        // Trigger re-render by dispatching a custom event
        window.dispatchEvent(new Event('storage'))
      }
    } catch (error) {
      setMsg('Lỗi xóa ảnh: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
        Thông tin cá nhân
      </Typography>
      
      {msg && (
        <Alert 
          severity={msg.includes('thành công') ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setMsg(null)}
        >
          {msg}
        </Alert>
      )}
      
      {/* Avatar Section */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              src={avatarPreview || (profile.avatar ? `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${profile.avatar}` : '')}
              alt={profile.name}
              sx={{ 
                width: 120, 
                height: 120, 
                border: 3, 
                borderColor: 'primary.main',
                fontSize: '48px'
              }}
            >
              {!profile.avatar && !avatarPreview && profile.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            
            {uploadingAvatar && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 120,
                  height: 120,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={uploadingAvatar}
            >
              {profile.avatar ? 'Đổi ảnh' : 'Thêm ảnh'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </Button>
            
            {profile.avatar && (
              <Button
                variant="outlined"
                color="error"
                onClick={deleteAvatar}
                disabled={uploadingAvatar}
                startIcon={<DeleteIcon />}
              >
                Xóa ảnh
              </Button>
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Định dạng: JPEG, PNG, WebP. Tối đa 2MB
          </Typography>
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        {/* Left Column - Statistics */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {profile.stats && (
            <>
              {/* Loyalty Level Display */}
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Hạng khách hàng</Typography>
                  {(() => {
                    const badges = {
                      'normal': { color: '#6c757d', text: 'Khách hàng thường', icon: '👤' },
                      'vip': { color: '#ffd700', text: 'Khách hàng VIP', icon: '⭐' }
                    }
                    const badge = badges[profile.stats?.loyaltyLevel || 'normal'] || badges.normal
                    
                    return (
                      <Box>
                        <Box sx={{ fontSize: '48px', mb: 1 }}>
                          {badge.icon}
                        </Box>
                        <Chip 
                          label={badge.text}
                          sx={{ 
                            bgcolor: badge.color, 
                            color: 'white',
                            fontWeight: 600,
                            px: 2,
                            py: 0.5
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Sử dụng {profile.stats?.totalBookings || 0} dịch vụ
                        </Typography>
                        {(profile.stats?.loyaltyLevel || 'normal') === 'normal' && (
                          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                            💡 Sử dụng từ 3 dịch vụ để trở thành VIP và nhận ưu đãi 10%
                          </Typography>
                        )}
                      </Box>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Stats Summary Cards */}
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <ReceiptIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={600}>
                        {profile.stats?.totalBookings || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tổng đơn
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        {profile.stats?.completedBookings || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hoàn thành
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Total Spent */}
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {(profile.stats?.totalSpent || 0).toLocaleString('vi-VN')} ₫
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng chi tiêu
                  </Typography>
                </CardContent>
              </Card>

              {/* Top Services */}
              {profile.stats?.serviceStats && Object.keys(profile.stats.serviceStats).length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Dịch vụ thường dùng</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(profile.stats?.serviceStats || {})
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 3)
                        .map(([serviceName, stats], index, arr) => (
                          <Box 
                            key={serviceName} 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              py: 1,
                              borderBottom: index < arr.length - 1 ? 1 : 0,
                              borderColor: 'divider'
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{serviceName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(stats?.totalSpent || 0).toLocaleString('vi-VN')} ₫
                              </Typography>
                            </Box>
                            <Chip 
                              label={stats.count} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          </Box>
        </Grid>
        
        {/* Right Column - Profile Form */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Profile Information Form */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon /> Thông tin cơ bản
              </Typography>
              <Box component="form" onSubmit={handleProfileSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  margin="normal"
                  placeholder="Nhập địa chỉ của bạn"
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={updating}
                  sx={{ mt: 2 }}
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon /> Đổi mật khẩu
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  size="small"
                >
                  {showPasswordChange ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
              </Box>
              
              {showPasswordChange && (
                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Mật khẩu hiện tại"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Mật khẩu mới"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                    margin="normal"
                    required
                    inputProps={{ minLength: 6 }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Xác nhận mật khẩu mới"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    margin="normal"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={updating}
                    sx={{ mt: 2 }}
                  >
                    {updating ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
