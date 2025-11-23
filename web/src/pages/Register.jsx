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
  Link as MuiLink,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material'
import { PersonAdd as PersonAddIcon, LocalShipping as TruckIcon, Build as WorkerIcon, Person as CustomerIcon } from '@mui/icons-material'

export default function Register(){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState('')
  const [role, setRole] = useState('customer') // customer, worker, driver
  
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }
    
    try{
      // build payload with selected role
      const payload = { name, phone, password, role, address }
      await api.post('/api/users/register', payload)
      navigate('/login')
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
              <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
                Tạo tài khoản
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đăng ký tài khoản để sử dụng dịch vụ
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
                label="Họ tên"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={e => setName(e.target.value)}
                margin="normal"
                required
                autoFocus
                autoComplete="name"
              />

              <TextField
                fullWidth
                label="Số điện thoại"
                placeholder="09xxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                margin="normal"
                required
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
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword}
                helperText={
                  confirmPassword && password !== confirmPassword
                    ? 'Mật khẩu xác nhận không khớp'
                    : ''
                }
              />

              <TextField
                fullWidth
                label="Địa chỉ (tuỳ chọn)"
                placeholder="Số nhà, đường, quận/huyện"
                value={address}
                onChange={e => setAddress(e.target.value)}
                margin="normal"
                autoComplete="street-address"
              />

              <FormControl component="fieldset" sx={{ mb: 2, mt: 1 }}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Loại tài khoản
                </FormLabel>
                <RadioGroup
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <FormControlLabel 
                    value="customer" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CustomerIcon fontSize="small" />
                        Khách hàng (Sử dụng dịch vụ)
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="worker" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkerIcon fontSize="small" />
                        Thợ (Cung cấp dịch vụ sửa chữa)
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="driver" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TruckIcon fontSize="small" />
                        Tài xế (Cung cấp dịch vụ vận chuyển)
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {(role === 'worker' || role === 'driver') && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Tài khoản {role === 'worker' ? 'Thợ' : 'Tài xế'} sẽ ở trạng thái <strong>chờ duyệt</strong>. 
                  CCCD/giấy tờ do quản trị viên cập nhật khi xét duyệt.
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                Đã có tài khoản?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Đăng nhập ngay
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
