import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../config/messages'
import { ServiceMediaGallery } from '../components/ServiceMediaGallery'
import ReviewSection from '../components/ReviewSection'

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user && (user.role === 'admin' || user.role === 'worker')

  useEffect(() => {
    if (id) {
      loadService()
    }
  }, [id])

  const loadService = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/services/${id}`)
      setService(response.data)
    } catch (error) {
      console.error('Error loading service:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton" style={{height: 300, borderRadius: 12, marginBottom: 20}} />
        <div className="skeleton" style={{height: 24, width: '60%', borderRadius: 8, marginBottom: 12}} />
        <div className="skeleton" style={{height: 16, width: '90%', borderRadius: 8, marginBottom: 8}} />
        <div className="skeleton" style={{height: 16, width: '70%', borderRadius: 8, marginBottom: 20}} />
        <div className="skeleton" style={{height: 40, width: '30%', borderRadius: 10}} />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="card">
        <h1>Không tìm thấy dịch vụ</h1>
        <Link to="/" className="btn primary">Quay lại trang chủ</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <ServiceMediaGallery 
          images={service.images || []} 
          videos={service.videos || []} 
        />
        
        <h1 style={{marginTop: 20, marginBottom: 16}}>{service.name}</h1>
        
        {service.worker && (
          <div className="service-worker" style={{marginBottom: 16}}>
            Thợ: {service.worker.name}
            {service.worker.isOnline === false && (
              <span className="worker-offline"> (Tạm nghỉ)</span>
            )}
          </div>
        )}
        
        {service.category && (
          <div style={{marginBottom: 12}}>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: service.category === 'Dịch Vụ Vận Chuyển' ? '#e3f2fd' : '#f5f5f5',
              color: service.category === 'Dịch Vụ Vận Chuyển' ? '#1976d2' : '#666',
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 500
            }}>
              {service.category}
            </span>
          </div>
        )}
        
        <p style={{fontSize: 16, lineHeight: 1.6, marginBottom: 20, color: 'var(--muted)'}}>
          {service.description}
        </p>
        
        {service.category === 'Dịch Vụ Vận Chuyển' && service.vehicleSpecs && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20
          }}>
            <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333'}}>
              🚚 Thông Tin Xe
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12}}>
              {service.vehicleSpecs.loadCapacity && (
                <div>
                  <div style={{fontSize: 13, color: '#666', marginBottom: 4}}>Tải trọng</div>
                  <div style={{fontSize: 16, fontWeight: 600, color: '#1976d2'}}>
                    {service.vehicleSpecs.loadCapacity.toLocaleString('vi-VN')} kg
                  </div>
                </div>
              )}
              {service.vehicleSpecs.truckBedDimensions && (
                <>
                  <div>
                    <div style={{fontSize: 13, color: '#666', marginBottom: 4}}>Chiều dài thùng</div>
                    <div style={{fontSize: 16, fontWeight: 600}}>
                      {service.vehicleSpecs.truckBedDimensions.length} m
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: 13, color: '#666', marginBottom: 4}}>Chiều rộng thùng</div>
                    <div style={{fontSize: 16, fontWeight: 600}}>
                      {service.vehicleSpecs.truckBedDimensions.width} m
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: 13, color: '#666', marginBottom: 4}}>Chiều cao thùng</div>
                    <div style={{fontSize: 16, fontWeight: 600}}>
                      {service.vehicleSpecs.truckBedDimensions.height} m
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24}}>
          <div className="price" style={{fontSize: 20, fontWeight: 600}}>
            {(service.effectivePrice ?? service.basePrice)?.toLocaleString('vi-VN')} VNĐ
          </div>
          {service.vipPrice && (
            <div className="vip-price" style={{fontSize: 16, color: 'var(--primary)'}}>
              VIP: {service.vipPrice.toLocaleString('vi-VN')} VNĐ
            </div>
          )}
        </div>
        
        {!isAdmin && (
          service.worker?.isOnline === false ? (
            <button 
              className="btn disabled" 
              disabled
              style={{marginBottom: 24}}
            >
              Thợ tạm nghỉ - Không thể đặt lịch
            </button>
          ) : (
            <Link 
              className="btn primary" 
              to="/booking" 
              state={{ service }}
              style={{marginBottom: 24}}
            >
              Đặt lịch ngay
            </Link>
          )
        )}
      </div>

      <ReviewSection serviceId={service._id} user={user} />
    </div>
  )
}