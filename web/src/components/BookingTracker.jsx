import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const BookingTracker = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io();
    setSocket(newSocket);

    // Load booking details
    loadBookingDetails();

    // Socket event listeners
    newSocket.on('worker_location_update', (data) => {
      if (data.bookingId === bookingId) {
        setBooking(prev => ({
          ...prev,
          tracking: {
            ...prev.tracking,
            workerLocation: data.workerLocation,
            estimatedArrival: data.estimatedArrival
          }
        }));
      }
    });

    newSocket.on('booking_status_update', (data) => {
      if (data.bookingId === bookingId) {
        setBooking(prev => ({
          ...prev,
          status: data.status,
          timeline: { ...prev.timeline, ...data.timeline }
        }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/enhanced/booking/${bookingId}/tracking`);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Load booking error:', error);
      alert(UI_MESSAGES.USERS.BOOKING_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'Đang tìm thợ', color: 'orange', icon: '🔍' },
      assigned: { text: 'Đã có thợ nhận việc', color: 'blue', icon: '👨‍🔧' },
      confirmed: { text: 'Thợ đã xác nhận', color: 'green', icon: '✅' },
      in_progress: { text: 'Đang thực hiện', color: 'purple', icon: '🔧' },
      completed: { text: 'Hoàn thành', color: 'green', icon: '✅' },
      cancelled: { text: 'Đã hủy', color: 'red', icon: '❌' }
    };
    return statusMap[status] || { text: status, color: 'gray', icon: '❓' };
  };

  const formatTime = (date) => {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleString('vi-VN');
  };

  const calculateTimeRemaining = (estimatedArrival) => {
    if (!estimatedArrival) return null;
    
    const now = new Date();
    const eta = new Date(estimatedArrival);
    const diff = eta - now;
    
    if (diff <= 0) return 'Đã đến';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="booking-tracker loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-tracker error">
        <h2>Không tìm thấy đơn hàng</h2>
        <p>Vui lòng kiểm tra lại ID đơn hàng</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="booking-tracker">
      {/* Header */}
      <div className="tracker-header">
        <h1>Theo dõi đơn hàng</h1>
        <div className="booking-id">#{booking.id.slice(-8)}</div>
      </div>

      {/* Status */}
      <div className={`status-card ${statusInfo.color}`}>
        <div className="status-icon">{statusInfo.icon}</div>
        <div className="status-text">
          <h2>{statusInfo.text}</h2>
          {booking.tracking.estimatedArrival && (
            <p>Dự kiến đến: {calculateTimeRemaining(booking.tracking.estimatedArrival)}</p>
          )}
        </div>
      </div>

      {/* Worker Info */}
      {booking.worker && (
        <div className="worker-info-card">
          <div className="worker-details">
            <div className="worker-avatar">
              {booking.worker.name.charAt(0)}
            </div>
            <div className="worker-data">
              <h3>{booking.worker.name}</h3>
              <div className="worker-rating">
                ⭐ {booking.worker.rating.toFixed(1)} • 📞 {booking.worker.phone}
              </div>
              {booking.worker.location && (
                <div className="worker-location">
                  📍 {booking.worker.location.district}
                </div>
              )}
            </div>
          </div>
          
          <div className="worker-actions">
            <button 
              className="btn-call"
              onClick={() => window.open(`tel:${booking.worker.phone}`)}
            >
              📞 Gọi
            </button>
            <button 
              className="btn-message"
              onClick={() => {/* Open chat modal */}}
            >
              💬 Nhắn tin
            </button>
          </div>
        </div>
      )}

      {/* Map placeholder */}
      {booking.tracking.workerLocation && (
        <div className="map-container">
          <div className="map-placeholder">
            <h3>🗺️ Vị trí thợ</h3>
            <p>Thợ đang ở: {booking.worker?.location?.district}</p>
            <p>Khoảng cách: ~{Math.random() * 5 + 1}km</p>
            <small>*Tích hợp Google Maps sẽ hiển thị vị trí thực tế</small>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="timeline-card">
        <h3>Lịch sử đơn hàng</h3>
        <div className="timeline">
          <div className={`timeline-item ${booking.timeline.createdAt ? 'completed' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Đơn hàng được tạo</h4>
              <p>{formatTime(booking.timeline.createdAt)}</p>
            </div>
          </div>

          <div className={`timeline-item ${booking.timeline.assignedAt ? 'completed' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Thợ được phân công</h4>
              <p>{formatTime(booking.timeline.assignedAt)}</p>
            </div>
          </div>

          <div className={`timeline-item ${booking.timeline.confirmedAt ? 'completed' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Thợ xác nhận nhận việc</h4>
              <p>{formatTime(booking.timeline.confirmedAt)}</p>
            </div>
          </div>

          <div className={`timeline-item ${booking.timeline.startedAt ? 'completed' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Bắt đầu thực hiện</h4>
              <p>{formatTime(booking.timeline.startedAt)}</p>
            </div>
          </div>

          <div className={`timeline-item ${booking.timeline.completedAt ? 'completed' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Hoàn thành</h4>
              <p>{formatTime(booking.timeline.completedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="service-details-card">
        <h3>Chi tiết dịch vụ</h3>
        <div className="service-info">
          <div className="info-row">
            <span className="label">Loại dịch vụ:</span>
            <span className="value">{booking.serviceDetails.type}</span>
          </div>
          <div className="info-row">
            <span className="label">Vấn đề:</span>
            <span className="value">{booking.serviceDetails.issueDescription}</span>
          </div>
          <div className="info-row">
            <span className="label">Địa chỉ:</span>
            <span className="value">{booking.location.fullAddress}</span>
          </div>
          <div className="info-row">
            <span className="label">Quận:</span>
            <span className="value">{booking.location.district}</span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="pricing-card">
        <h3>Chi phí</h3>
        <div className="pricing-breakdown">
          {booking.pricing.breakdown?.map((item, idx) => (
            <div key={idx} className="pricing-row">
              <span className="item">{item.item}</span>
              <span className={`amount ${item.amount < 0 ? 'discount' : ''}`}>
                {item.amount < 0 ? '' : '+'}{item.amount.toLocaleString()} VNĐ
              </span>
            </div>
          ))}
          <div className="pricing-total">
            <span className="total-label">Tổng cộng:</span>
            <span className="total-amount">{booking.pricing.finalPrice.toLocaleString()} VNĐ</span>
          </div>
        </div>
      </div>

      {/* Action buttons based on status */}
      <div className="action-buttons">
        {booking.status === 'pending' && (
          <button className="btn-cancel" onClick={() => {/* Cancel booking */}}>
            Hủy đơn hàng
          </button>
        )}
        
        {booking.status === 'completed' && (
          <>
            <button className="btn-review" onClick={() => {/* Open review modal */}}>
              ⭐ Đánh giá thợ
            </button>
            <button className="btn-rebook" onClick={() => {/* Rebook same service */}}>
              🔄 Đặt lại dịch vụ
            </button>
          </>
        )}
      </div>

      {/* Emergency contact */}
      <div className="emergency-contact">
        <p>Cần hỗ trợ? Liên hệ: <a href="tel:1900xxx">1900 XXX XXX</a></p>
      </div>
    </div>
  );
};

export default BookingTracker;