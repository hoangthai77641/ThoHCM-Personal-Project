import { useState, useEffect } from 'react';
import api from '../api.js';

export default function NearbyWorkers() {
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [maxDistance, setMaxDistance] = useState(10000); // 10km default

  const serviceTypes = [
    { value: 'all', label: 'Tất cả dịch vụ' },
    { value: 'air_conditioning', label: 'Điều hòa' },
    { value: 'refrigerator', label: 'Tủ lạnh' },
    { value: 'washing_machine', label: 'Máy giặt' },
    { value: 'water_heater', label: 'Bình nóng lạnh' },
    { value: 'electrical', label: 'Điện nước' }
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        findNearbyWorkers(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Find nearby workers API call
  const findNearbyWorkers = async (lat, lng) => {
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lng,
        maxDistance: maxDistance,
        limit: 50
      });
      
      if (serviceType !== 'all') {
        params.append('serviceType', serviceType);
      }

      const response = await api.get(`/api/users/nearby-workers?${params}`);
      setWorkers(response.data.workers);
      setLoading(false);
    } catch (err) {
      console.error('Find nearby workers error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tìm thợ');
      setLoading(false);
    }
  };

  // Search again when filters change
  const handleFilterChange = () => {
    if (location) {
      setLoading(true);
      findNearbyWorkers(location.latitude, location.longitude);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [serviceType, maxDistance]);

  const formatSpecializations = (specializations) => {
    if (!specializations || specializations.length === 0) return 'Đa dịch vụ';
    return specializations.map(spec => {
      const service = serviceTypes.find(s => s.value === spec);
      return service ? service.label : spec;
    }).join(', ');
  };

  const getDistanceColor = (distance) => {
    if (distance <= 2) return '#22c55e'; // green
    if (distance <= 5) return '#eab308'; // yellow  
    if (distance <= 10) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="nearby-workers-page">
      <div className="page-header">
        <h1>🔍 Tìm thợ gần bạn</h1>
        <p>Tìm những thợ sửa chữa gần nhất và uy tín</p>
      </div>

      {/* Location and Filters */}
      <div className="search-controls">
        <div className="location-section">
          <button 
            onClick={getCurrentLocation} 
            className="btn primary location-btn"
            disabled={loading}
          >
            📍 {location ? 'Cập nhật vị trí' : 'Lấy vị trí hiện tại'}
          </button>
          {location && (
            <span className="location-info">
              📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </span>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Loại dịch vụ:</label>
            <select 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              className="filter-select"
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Bán kính tìm kiếm:</label>
            <select 
              value={maxDistance} 
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tìm thợ gần bạn...</p>
        </div>
      )}

      {/* Workers List */}
      {!loading && workers.length > 0 && (
        <div className="workers-section">
          <div className="section-header">
            <h2>🔧 {workers.length} thợ được tìm thấy</h2>
            <p>Sắp xếp theo khoảng cách gần nhất</p>
          </div>
          
          <div className="workers-grid">
            {workers.map(worker => (
              <div key={worker._id} className="worker-card">
                <div className="worker-header">
                  <div className="worker-info">
                    <h3>{worker.name}</h3>
                    <p className="worker-phone">📞 {worker.phone}</p>
                  </div>
                  <div className="worker-distance">
                    <span 
                      className="distance-badge"
                      style={{ backgroundColor: getDistanceColor(worker.distance) }}
                    >
                      {worker.distance ? `${worker.distance} km` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="worker-details">
                  <div className="detail-row">
                    <span className="label">🔧 Chuyên môn:</span>
                    <span className="value">{formatSpecializations(worker.specializations)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">⭐ Đánh giá:</span>
                    <span className="value">
                      {worker.rating > 0 ? `${worker.rating}/5` : 'Chưa có đánh giá'}
                      {worker.totalJobs > 0 && (
                        <span className="job-count"> ({worker.totalJobs} công việc)</span>
                      )}
                    </span>
                  </div>

                  {worker.responseTime > 0 && (
                    <div className="detail-row">
                      <span className="label">⚡ Thời gian phản hồi:</span>
                      <span className="value">{worker.responseTime} phút</span>
                    </div>
                  )}

                  {worker.location?.fullAddress && (
                    <div className="detail-row">
                      <span className="label">📍 Địa chỉ:</span>
                      <span className="value">{worker.location.fullAddress}</span>
                    </div>
                  )}
                </div>

                <div className="worker-actions">
                  <button 
                    className="btn primary contact-btn"
                    onClick={() => window.open(`tel:${worker.phone}`)}
                  >
                    📞 Gọi ngay
                  </button>
                  <button 
                    className="btn secondary book-btn"
                    onClick={() => {
                      // TODO: Navigate to booking page with pre-filled worker
                      console.log('Book worker:', worker._id);
                    }}
                  >
                    📅 Đặt lịch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No workers found */}
      {!loading && location && workers.length === 0 && (
        <div className="no-workers">
          <div className="empty-state">
            <h3>😔 Không tìm thấy thợ nào</h3>
            <p>Thử mở rộng bán kính tìm kiếm hoặc thay đổi loại dịch vụ</p>
            <button 
              onClick={() => setMaxDistance(20000)}
              className="btn primary"
            >
              🔍 Mở rộng tìm kiếm 20km
            </button>
          </div>
        </div>
      )}

      {/* Getting started */}
      {!loading && !location && (
        <div className="getting-started">
          <div className="intro-card">
            <h3>🚀 Bắt đầu tìm thợ</h3>
            <p>Nhấn "Lấy vị trí hiện tại" để tìm những thợ sửa chữa gần bạn nhất</p>
            <ul>
              <li>✅ Xem khoảng cách chính xác</li>
              <li>✅ Đánh giá và số lượng công việc</li>
              <li>✅ Liên hệ trực tiếp qua điện thoại</li>
              <li>✅ Đặt lịch sửa chữa ngay</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}