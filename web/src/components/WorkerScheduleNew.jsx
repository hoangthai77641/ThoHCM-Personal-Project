import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/WorkerScheduleNew.css';

const WorkerScheduleNew = ({ selectedService }) => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [services, setServices] = useState([]);

  // Default time slots
  const timeSlots = {
    morning: ["08:00", "09:00", "10:00", "11:00", "12:00"],
    afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00"],
    evening: ["19:00", "20:00"]
  };

  useEffect(() => {
    if (selectedService?.worker) {
      fetchWorkerSchedule();
    }
    fetchServices();
  }, [selectedDate, selectedService]);

  const fetchWorkerSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Only get schedule of worker in selected service
      const workerId = selectedService.worker._id || selectedService.worker;
      const response = await api.get(`/api/worker-schedule/worker/${workerId}`, {
        params: { date: selectedDate }
      });
      
      // Set worker as selected worker immediately
      const workerData = response.data;
      setSelectedWorker(workerData);
      setWorkers([workerData]); // Only 1 worker
    } catch (err) {
      console.error('Error fetching worker schedule:', err);
      setError('Lỗi khi tải lịch thợ');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServices(response.data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableSlots = (worker, timeGroup) => {
    if (!worker.availableSlots) return [];
    
    const targetDate = new Date(selectedDate);
    const slots = [];
    
    timeSlots[timeGroup].forEach(time => {
      const [hour, minute] = time.split(':').map(Number);
      const slotDate = new Date(targetDate);
      slotDate.setHours(hour, minute, 0, 0);
      
      // Find corresponding slot in database
      const dbSlot = worker.availableSlots.find(slot => {
        const slotStartTime = new Date(slot.startTime);
        return slotStartTime.getHours() === hour && 
               slotStartTime.getMinutes() === minute &&
               slotStartTime.toDateString() === targetDate.toDateString();
      });
      
      slots.push({
        time: time,
        datetime: slotDate,
        available: dbSlot && !dbSlot.isBooked,
        slot: dbSlot,
        booked: dbSlot && dbSlot.isBooked
      });
    });
    
    return slots;
  };

  const handleBookSlot = (worker, timeSlot) => {
    if (!timeSlot.available || !timeSlot.slot) {
      alert('Khung giờ này không khả dụng');
      return;
    }
    
    setSelectedWorker(worker);
    setSelectedSlot({
      ...timeSlot.slot,
      time: timeSlot.time,
      datetime: timeSlot.datetime
    });
    setShowBookingModal(true);
  };

  const handleBooking = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để đặt lịch');
        return;
      }

      const response = await api.post(`/api/worker-schedule/book/${selectedWorker.worker._id}/${selectedSlot._id}`, {
        serviceId: bookingData.serviceId,
        address: bookingData.address,
        note: bookingData.note
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const bookingId = response.data.booking;
        const workerName = selectedWorker.worker.name;
        const slotTime = new Date(selectedSlot.startTime).toLocaleString('vi-VN');
        
        const successMessage = `Đặt lịch thành công với ${workerName}!\n\nThời gian: ${slotTime}\n\nBạn sẽ được chuyển đến trang "Đơn của tôi" để xem chi tiết đơn hàng.`;
        
        alert(successMessage);
        setShowBookingModal(false);
        
        // Redirect to My Bookings page
        navigate('/my-bookings', {
          state: { 
            newBookingId: bookingId,
            message: 'Đặt lịch thành công! Thợ sẽ liên hệ với bạn sớm.' 
          }
        });
        
        fetchWorkers(); // Refresh the list
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Lỗi khi đặt lịch');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Sẵn sàng';
      case 'busy': return 'Đang bận';
      case 'offline': return 'Offline';
      default: return 'Không xác định';
    }
  };

  if (!selectedService) {
    return (
      <div className="worker-schedule-container">
        <div className="error">
          <p>Không tìm thấy thông tin dịch vụ</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="worker-schedule-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch thợ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="worker-schedule-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchWorkerSchedule} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-schedule-container">
      <div className="header">
        <h2>Lịch Làm Việc Thợ</h2>
        <div className="date-selector">
          <label>Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="selected-date">
        <h3>{formatDate(selectedDate)}</h3>
      </div>

      {workers.length === 0 ? (
        <div className="no-workers">
          <p>Không có thợ nào khả dụng trong ngày này</p>
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map((workerData) => (
            <div key={workerData.worker._id} className="worker-card">
              <div className="worker-header">
                <div className="worker-info">
                  <h4>{workerData.worker.name}</h4>
                  <p className="worker-phone">{workerData.worker.phone}</p>
                  <div className="worker-status">
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(workerData.currentStatus) }}
                    ></span>
                    <span>{getStatusText(workerData.currentStatus)}</span>
                  </div>
                </div>
              </div>

              <div className="time-slots">
                {/* Morning time slots */}
                <div className="time-group">
                  <h5 className="time-group-title">🌅 Sáng</h5>
                  <div className="slots-grid">
                    {getAvailableSlots(workerData, 'morning').map((slot, index) => (
                      <button
                        key={`morning-${index}`}
                        className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${slot.booked ? 'booked' : ''}`}
                        onClick={() => handleBookSlot(workerData, slot)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {slot.booked && <span className="booked-indicator">Đã đặt</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon time slots */}
                <div className="time-group">
                  <h5 className="time-group-title">☀️ Chiều</h5>
                  <div className="slots-grid">
                    {getAvailableSlots(workerData, 'afternoon').map((slot, index) => (
                      <button
                        key={`afternoon-${index}`}
                        className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${slot.booked ? 'booked' : ''}`}
                        onClick={() => handleBookSlot(workerData, slot)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {slot.booked && <span className="booked-indicator">Đã đặt</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evening time slots */}
                <div className="time-group">
                  <h5 className="time-group-title">🌙 Tối</h5>
                  <div className="slots-grid">
                    {getAvailableSlots(workerData, 'evening').map((slot, index) => (
                      <button
                        key={`evening-${index}`}
                        className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${slot.booked ? 'booked' : ''}`}
                        onClick={() => handleBookSlot(workerData, slot)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {slot.booked && <span className="booked-indicator">Đã đặt</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          worker={selectedWorker}
          slot={selectedSlot}
          services={services}
          selectedService={selectedService}
          onClose={() => setShowBookingModal(false)}
          onBook={handleBooking}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ worker, slot, services, selectedService, onClose, onBook }) => {
  const [formData, setFormData] = useState({
    serviceId: selectedService?._id || '',
    address: '',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onBook(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Đặt lịch với {worker.worker.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="booking-info">
          <p><strong>Thời gian:</strong> {slot.time} - {formatDate(slot.datetime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Dịch vụ *</label>
            {selectedService ? (
              <div className="selected-service">
                <p><strong>{selectedService.name}</strong></p>
                <p>Giá: {selectedService.basePrice?.toLocaleString('vi-VN')} VNĐ</p>
                <input type="hidden" value={selectedService._id} />
              </div>
            ) : (
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
              >
                <option value="">Chọn dịch vụ</option>
                {services.map(service => (
                  <option key={service._id} value={service._id}>
                    {service.name} - {service.basePrice?.toLocaleString('vi-VN')} VNĐ
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Địa chỉ *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Nhập địa chỉ cần thực hiện dịch vụ"
              required
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Nhập ghi chú (không bắt buộc)"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Hủy
            </button>
            <button type="submit" className="book-btn">
              Đặt lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default WorkerScheduleNew;