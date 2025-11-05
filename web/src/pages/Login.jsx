import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Link as MuiLink
} from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'

export default function Login(){
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await api.post('/api/users/login', { phone, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      // Notify other parts of the app in the same tab that auth changed
      try {
        window.dispatchEvent(new Event('authChanged'))
      } catch (e) {
        // ignore
      }
      
      // Redirect based on user role
      const userRole = res.data.user?.role
      if (userRole === 'admin') {
        navigate('/admin')
      } else if (userRole === 'worker') {
        navigate('/profile')
      } else {
        navigate('/')
      }
    }catch(err){
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
                Đăng nhập
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={submit} noValidate>
              <TextField
                fullWidth
                label="Số điện thoại"
                placeholder="Ví dụ: 09xxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                margin="normal"
                required
                autoFocus
                autoComplete="tel"
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />

              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <MuiLink
                  component={Link}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Quên mật khẩu?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                Chưa có tài khoản?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Đăng ký ngay
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
