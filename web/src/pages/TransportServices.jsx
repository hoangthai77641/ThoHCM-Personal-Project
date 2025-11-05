import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import { ServiceMediaGallery } from '../components/ServiceMediaGallery'
import StarDisplay from '../components/StarDisplay'
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Skeleton, 
  Chip,
  Container,
  Alert
} from '@mui/material'
import { LocalShipping as TruckIcon } from '@mui/icons-material'

export default function TransportServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user')||'null')
  const isAdmin = user && (user.role === 'admin' || user.role === 'worker')

  useEffect(() => {
    loadTransportServices()
  }, [])

  const loadTransportServices = () => {
    setLoading(true)
    api.get('/api/services?category=Dịch Vụ Vận Chuyển')
      .then(r => setServices(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  if (loading) return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 3
      }}
    >
      {Array.from({length:6}).map((_,i) => (
        <Card key={i}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent>
            <Skeleton variant="text" height={32} width="60%" />
            <Skeleton variant="text" height={20} width="90%" />
            <Skeleton variant="text" height={20} width="70%" />
          </CardContent>
          <CardActions>
            <Skeleton variant="rectangular" height={36} width={100} />
            <Skeleton variant="rectangular" height={36} width={100} />
          </CardActions>
        </Card>
      ))}
    </Box>
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <TruckIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Dịch Vụ Vận Chuyển
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Tìm tài xế và xe tải phù hợp với nhu cầu vận chuyển của bạn
        </Typography>
        <Chip 
          label={`${services.length} tài xế sẵn sàng`}
          color="primary"
          size="medium"
        />
      </Box>

      {/* No services found */}
      {services.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Hiện tại chưa có dịch vụ vận chuyển nào. Vui lòng quay lại sau!
        </Alert>
      )}

      {/* Services Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3
        }}
      >
        {services.map(s => (
          <Card 
            key={s._id}
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <ServiceMediaGallery 
              images={s.images || []} 
              videos={s.videos || []} 
            />
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                component={Link}
                to={`/service/${s._id}`}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'block',
                  mb: 1,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {s.name}
              </Typography>
              
              {s.worker && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tài xế: {s.worker.name}
                  {s.worker.isOnline === false && (
                    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                      (Tạm nghỉ)
                    </Typography>
                  )}
                </Typography>
              )}
              
              {/* Vehicle Specifications */}
              {s.vehicleSpecs && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Thông số xe:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {s.vehicleSpecs.loadCapacity && (
                      <Chip 
                        label={`Tải trọng: ${s.vehicleSpecs.loadCapacity} kg`}
                        size="small"
                        variant="outlined"
                        icon={<TruckIcon />}
                      />
                    )}
                    {s.vehicleSpecs.truckBedDimensions && (
                      <Chip 
                        label={`Kích thước: ${s.vehicleSpecs.truckBedDimensions.length}x${s.vehicleSpecs.truckBedDimensions.width}x${s.vehicleSpecs.truckBedDimensions.height}m`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {s.vehicleSpecs.pricePerKm && (
                      <Chip 
                        label={`${s.vehicleSpecs.pricePerKm.toLocaleString('vi-VN')} VNĐ/km`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mb: 1 }}>
                <StarDisplay 
                  rating={s.averageRating} 
                  reviewCount={s.reviewCount}
                  showCount={true}
                />
              </Box>
              
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                {(s.effectivePrice ?? s.basePrice)?.toLocaleString('vi-VN')} VNĐ
                {s.category === 'Dịch Vụ Vận Chuyển' && ' (giá khởi điểm)'}
              </Typography>
              
              {s.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {s.description}
                </Typography>
              )}
            </CardContent>
            
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button 
                component={Link} 
                to={`/service/${s._id}`}
                variant="outlined"
                size="small"
                fullWidth
              >
                Xem chi tiết
              </Button>
              {!isAdmin && (
                s.worker?.isOnline === false ? (
                  <Button 
                    variant="contained"
                    disabled
                    size="small"
                    fullWidth
                  >
                    Tài xế tạm nghỉ
                  </Button>
                ) : (
                  <Button 
                    component={Link} 
                    to="/booking" 
                    state={{ service: s }}
                    variant="contained"
                    size="small"
                    fullWidth
                  >
                    Đặt xe
                  </Button>
                )
              )}
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
