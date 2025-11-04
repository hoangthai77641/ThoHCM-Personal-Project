import React, { useEffect, useState } from 'react'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../config/messages'
import { Link, useSearchParams } from 'react-router-dom'
import { ServiceMediaGallery } from '../components/ServiceMediaGallery'
import ReviewSection from '../components/ReviewSection'
import StarDisplay from '../components/StarDisplay'
import BannerSlider from '../components/BannerSlider'
import SocketService from '../services/SocketService'
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
  Container 
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

export default function Home(){
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const user = JSON.parse(localStorage.getItem('user')||'null')
  const isAdmin = user && (user.role === 'admin' || user.role === 'worker')

  useEffect(()=>{
    loadServices()
  },[searchQuery])

  useEffect(() => {
    // Listen for worker status changes to refresh services
    const handleWorkerStatusChange = (data) => {
      console.log('[Socket Web] Worker status changed:', data);
      // Refresh services to update worker online status
      loadServices();
    };

    SocketService.connect();
    SocketService.on('workerStatusChanged', handleWorkerStatusChange);

    return () => {
      SocketService.off('workerStatusChanged', handleWorkerStatusChange);
    };
  }, [])

  const loadServices = () => {
    setLoading(true)
    const url = searchQuery ? `/api/services?search=${encodeURIComponent(searchQuery)}` : '/api/services'
    api.get(url)
      .then(r=>setServices(r.data))
      .catch(e=>console.error(e))
      .finally(()=>setLoading(false))
  }

  if (loading) return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 3
      }}
    >
      {Array.from({length:6}).map((_,i)=> (
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
      {/* Banner Slider - only show when not searching */}
      {!searchQuery && <Box sx={{ mb: 4 }}><BannerSlider /></Box>}
      
      {searchQuery && (
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          Kết quả tìm kiếm cho "{searchQuery}" ({services.length} dịch vụ)
        </Typography>
      )}
      
      {searchQuery && services.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, px: 3 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h5" component="h3" gutterBottom>
            Không tìm thấy dịch vụ nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Không có dịch vụ nào phù hợp với từ khóa "{searchQuery}"
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Gợi ý tìm kiếm:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['sửa máy lạnh', 'sửa máy giặt', 'sửa tủ lạnh', 'điện gia dụng', 'sửa xe máy'].map(suggestion => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  onClick={() => setSearchParams({ search: suggestion })}
                  variant="outlined"
                  clickable
                />
              ))}
            </Box>
          </Box>
          
          <Button 
            variant="contained"
            onClick={() => setSearchParams({})}
          >
            Xem tất cả dịch vụ
          </Button>
        </Card>
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3
          }}
        >
          {services.map(s=> (
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
                      Thợ: {s.worker.name}
                      {s.worker.isOnline === false && (
                        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                          (Tạm nghỉ)
                        </Typography>
                      )}
                    </Typography>
                  )}
                  
                  {s.category && (
                    <Chip 
                      label={s.category}
                      size="small"
                      color={s.category === 'Dịch Vụ Vận Chuyển' ? 'primary' : 'default'}
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  {s.category === 'Dịch Vụ Vận Chuyển' && s.vehicleSpecs && (
                    <Box sx={{ 
                      fontSize: 13, 
                      color: 'text.secondary',
                      mb: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      {s.vehicleSpecs.loadCapacity && (
                        <Chip 
                          label={`🚚 ${s.vehicleSpecs.loadCapacity} kg`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {s.vehicleSpecs.truckBedDimensions && (
                        <Chip 
                          label={`📦 ${s.vehicleSpecs.truckBedDimensions.length}x${s.vehicleSpecs.truckBedDimensions.width}x${s.vehicleSpecs.truckBedDimensions.height}m`}
                          size="small"
                          variant="outlined"
                        />
                      )}
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
                    {s.vipPrice && (
                      <Typography component="span" variant="body2" color="secondary" sx={{ ml: 1 }}>
                        (VIP: {s.vipPrice.toLocaleString('vi-VN')} VNĐ)
                      </Typography>
                    )}
                  </Typography>
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
                        Thợ tạm nghỉ
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
                        Đặt lịch
                      </Button>
                    )
                  )}
                </CardActions>
              </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
