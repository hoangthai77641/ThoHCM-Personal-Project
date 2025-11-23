import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Typography,
  Grid,
  Collapse
} from '@mui/material'
import { LocalShipping as TruckIcon } from '@mui/icons-material'
import api from '../api'

const CATEGORIES = [
  'Điện Lạnh',
  'Máy Giặt',
  'Điện Gia Dụng',
  'Hệ Thống Điện',
  'Sửa Xe Đạp',
  'Sửa Xe Máy',
  'Sửa Xe Oto',
  'Sửa Xe Điện',
  'Dịch Vụ Vận Chuyển'
]

export default function ServiceForm({ open, onClose, service, onSuccess }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isDriver = user?.role === 'driver'
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: isDriver ? 'Dịch Vụ Vận Chuyển' : 'Điện Lạnh',
    promoPercent: 0,
    vehicleSpecs: {
      loadCapacity: '',
      truckBedDimensions: {
        length: '',
        width: '',
        height: ''
      }
    }
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        basePrice: service.basePrice || '',
        category: service.category || (isDriver ? 'Dịch Vụ Vận Chuyển' : 'Điện Lạnh'),
        promoPercent: service.promoPercent || 0,
        vehicleSpecs: service.vehicleSpecs || {
          loadCapacity: '',
          truckBedDimensions: {
            length: '',
            width: '',
            height: ''
          }
        }
      })
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        category: isDriver ? 'Dịch Vụ Vận Chuyển' : 'Điện Lạnh',
        promoPercent: 0,
        vehicleSpecs: {
          loadCapacity: '',
          truckBedDimensions: {
            length: '',
            width: '',
            height: ''
          }
        }
      })
    }
    setError('')
  }, [service, open, isDriver])
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleVehicleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicleSpecs: {
        ...prev.vehicleSpecs,
        [field]: value
      }
    }))
  }
  
  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      vehicleSpecs: {
        ...prev.vehicleSpecs,
        truckBedDimensions: {
          ...prev.vehicleSpecs.truckBedDimensions,
          [dimension]: value
        }
      }
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validate vehicle specs for transportation services
      if (formData.category === 'Dịch Vụ Vận Chuyển') {
        if (!formData.vehicleSpecs.loadCapacity) {
          setError('Tải trọng xe là bắt buộc cho dịch vụ vận chuyển')
          setLoading(false)
          return
        }
        if (!formData.vehicleSpecs.truckBedDimensions.length || 
            !formData.vehicleSpecs.truckBedDimensions.width || 
            !formData.vehicleSpecs.truckBedDimensions.height) {
          setError('Kích thước thùng xe (dài, rộng, cao) là bắt buộc')
          setLoading(false)
          return
        }
      }
      
      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        category: formData.category,
        promoPercent: parseFloat(formData.promoPercent) || 0
      }
      
      // Add vehicle specs for transportation services
      if (formData.category === 'Dịch Vụ Vận Chuyển') {
        payload.vehicleSpecs = {
          loadCapacity: parseFloat(formData.vehicleSpecs.loadCapacity),
          truckBedDimensions: {
            length: parseFloat(formData.vehicleSpecs.truckBedDimensions.length),
            width: parseFloat(formData.vehicleSpecs.truckBedDimensions.width),
            height: parseFloat(formData.vehicleSpecs.truckBedDimensions.height)
          }
        }
      }
      
      if (service) {
        await api.put(`/api/services/${service._id}`, payload)
      } else {
        await api.post('/api/services', payload)
      }
      
      onSuccess && onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const isTransportation = formData.category === 'Dịch Vụ Vận Chuyển'
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {service ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên dịch vụ"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            
            <TextField
              label="Giá cơ bản (VNĐ)"
              type="number"
              value={formData.basePrice}
              onChange={(e) => handleChange('basePrice', e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Category"
              select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              fullWidth
              disabled={isDriver} // Driver chỉ được tạo dịch vụ vận chuyển
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Giảm giá (%)"
              type="number"
              value={formData.promoPercent}
              onChange={(e) => handleChange('promoPercent', e.target.value)}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            
            {/* Vehicle Specs Section for Transportation Services */}
            <Collapse in={isTransportation}>
              <Box sx={{ 
                border: '2px dashed #1976d2',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#e3f2fd'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TruckIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Thông Tin Xe
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Thông tin xe là bắt buộc cho dịch vụ vận chuyển
                </Alert>
                
                <TextField
                  label="Tải trọng (kg)"
                  type="number"
                  value={formData.vehicleSpecs.loadCapacity}
                  onChange={(e) => handleVehicleSpecChange('loadCapacity', e.target.value)}
                  required={isTransportation}
                  fullWidth
                  sx={{ mb: 2 }}
                  helperText="Ví dụ: 1000 (cho xe 1 tấn)"
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Kích thước thùng xe (mét)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Chiều dài (m)"
                      type="number"
                      value={formData.vehicleSpecs.truckBedDimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      required={isTransportation}
                      fullWidth
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Chiều rộng (m)"
                      type="number"
                      value={formData.vehicleSpecs.truckBedDimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      required={isTransportation}
                      fullWidth
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Chiều cao (m)"
                      type="number"
                      value={formData.vehicleSpecs.truckBedDimensions.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      required={isTransportation}
                      fullWidth
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : (service ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
