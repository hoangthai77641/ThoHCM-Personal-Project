import React, { useState, useEffect } from 'react'
import api from '../api'
import NotificationManager from '../components/NotificationManager'

export default function BannerManagement() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notification',
    isActive: true,
    image: null
  })
  const [activeTab, setActiveTab] = useState('banners')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadBanners()
    }
  }, [isAdmin])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không có token xác thực')
      }
      
      const response = await api.get('/api/banners', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('API response:', response.data) // Debug log
      
      // Xử lý response data
      if (Array.isArray(response.data)) {
        setBanners(response.data)
      } else if (response.data && Array.isArray(response.data.items)) {
        setBanners(response.data.items)
      } else {
        setBanners([])
      }
    } catch (error) {
      console.error('Error loading banners:', error)
      setError(error.response?.data?.message || error.message || 'Không thể tải danh sách banner')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Vui lòng đăng nhập lại')
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('isActive', formData.isActive)
      
      if (formData.image) {
        formDataToSend.append('image', formData.image)
        console.log('Uploading file:', formData.image.name, formData.image.type, formData.image.size)
      }

      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }

      if (editingBanner) {
        const response = await api.put(`/api/banners/${editingBanner._id}`, formDataToSend, config)
        console.log('Update response:', response.data)
        alert('Cập nhật banner thành công!')
      } else {
        if (!formData.image) {
          alert('Vui lòng chọn ảnh cho banner')
          return
        }
        const response = await api.post('/api/banners', formDataToSend, config)
        console.log('Create response:', response.data)
        alert('Tạo banner thành công!')
      }

      setShowForm(false)
      setEditingBanner(null)
      setFormData({
        title: '',
        content: '',
        type: 'notification',
        isActive: true,
        image: null
      })
      loadBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Lỗi khi lưu banner: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      content: banner.content || '',
      type: banner.type || 'notification',
      isActive: banner.isActive,
      image: null
    })
    setShowForm(true)
  }

  const handleDelete = async (bannerId) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return
    
    try {
      await api.delete(`/api/banners/${bannerId}`)
      alert('Xóa banner thành công!')
      loadBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Lỗi khi xóa banner: ' + (error.response?.data?.message || error.message))
    }
  }

  const toggleActive = async (bannerId, currentStatus) => {
    try {
      await api.patch(`/api/banners/${bannerId}/toggle`)
      loadBanners()
    } catch (error) {
      console.error('Error toggling banner status:', error)
      alert('Lỗi khi thay đổi trạng thái: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleViewDetail = (banner) => {
    setSelectedBanner(banner)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedBanner(null)
  }

  if (!isAdmin) {
    return <div>Bạn không có quyền truy cập trang này.</div>
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="banner-management">
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', 
          borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca'
        }}>
          ❌ {error}
        </div>
      )}
      
      <div className="page-header">
        <h1>Quản lý Banner & Thông báo</h1>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            🖼️ Quản lý Banner
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            📢 Gửi Thông báo
          </button>
        </div>
        
        {activeTab === 'banners' && (
          <button 
            className="add-banner-btn"
            onClick={() => {
              setShowForm(true)
              setEditingBanner(null)
              setFormData({
                title: '',
                content: '',
                type: 'notification',
                isActive: true,
                image: null
              })
            }}
          >
            + Thêm
          </button>
        )}
      </div>

      {/* Banner Management Tab */}
      {activeTab === 'banners' && (
        <>
          {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="banner-form" className="banner-form">
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Nhập tiêu đề banner"
                />
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <textarea
                  className="form-textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Nhập nội dung chi tiết"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Loại</label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="notification">Thông báo</option>
                  <option value="promotion">Khuyến mãi</option>
                  <option value="blog">Blog</option>
                  <option value="advertisement">Quảng cáo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Hình ảnh</label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                />
                {editingBanner && editingBanner.imageUrl && (
                  <div className="current-image">
                    <p>Hình ảnh hiện tại:</p>
                    <img 
                      src={`http://localhost:5000${editingBanner.imageUrl}`} 
                      alt="Current banner"
                      style={{maxWidth: '200px', height: 'auto'}}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Hiển thị banner
                </label>
              </div>

              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn outline" onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button type="submit" form="banner-form" className="btn primary">
                {editingBanner ? 'Cập nhật' : 'Tạo Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner List Table */}
      <div className="banner-table-container">
        <div className="banner-table">
          <div className="table-header">
            <div className="header-cell">Hình ảnh</div>
            <div className="header-cell">Tiêu đề</div>
            <div className="header-cell">Loại</div>
            <div className="header-cell">Trạng thái</div>
            <div className="header-cell">Ngày tạo</div>
            <div className="header-cell">Thao tác</div>
          </div>
          
          {banners.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có banner nào. Hãy tạo banner đầu tiên!</p>
            </div>
          ) : (
            <div className="table-body">
              {banners.map(banner => (
                <div key={banner._id} className={`table-row ${!banner.isActive ? 'inactive' : ''}`}>
                  <div className="table-cell image-cell">
                    {banner.imageUrl ? (
                      <img 
                        src={`http://localhost:5000${banner.imageUrl}`}
                        alt={banner.title}
                        className="banner-thumbnail"
                      />
                    ) : (
                      <div className="no-image">Không có ảnh</div>
                    )}
                  </div>
                  
                  <div className="table-cell title-cell">
                    <h4>{banner.title}</h4>
                    {banner.content && (
                      <p className="content-preview">{banner.content.substring(0, 50)}...</p>
                    )}
                  </div>
                  
                  <div className="table-cell type-cell">
                    <span className={`type-badge type-${banner.type}`}>
                      {banner.type === 'notification' && 'THÔNG BÁO'}
                      {banner.type === 'promotion' && 'KHUYẾN MÃI'}
                      {banner.type === 'blog' && 'BLOG'}
                      {banner.type === 'advertisement' && 'QUẢNG CÁO'}
                    </span>
                  </div>
                  
                  <div className="table-cell status-cell">
                    <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                      {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </div>
                  
                  <div className="table-cell date-cell">
                    {new Date(banner.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <div className="table-cell action-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewDetail(banner)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className={`action-btn toggle ${banner.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive(banner._id, banner.isActive)}
                        title={banner.isActive ? 'Ẩn banner' : 'Hiện banner'}
                      >
                        {banner.isActive ? '🔴' : '�'}
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(banner)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(banner._id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Notification Management Tab */}
      {activeTab === 'notifications' && (
        <div className="notifications-tab">
          <NotificationManager />
        </div>
      )}

      {/* Banner Detail Modal */}
      {showDetailModal && selectedBanner && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết Banner</h3>
              <button className="btn-close" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="modal-body">
              {selectedBanner.imageUrl && (
                <div className="detail-image">
                  <img 
                    src={`http://localhost:5000${selectedBanner.imageUrl}`}
                    alt={selectedBanner.title}
                  />
                </div>
              )}
              
              <div className="detail-info">
                <div className="info-row">
                  <label>Tiêu đề:</label>
                  <span>{selectedBanner.title}</span>
                </div>
                
                <div className="info-row">
                  <label>Loại banner:</label>
                  <span className={`type-badge type-${selectedBanner.type}`}>
                    {selectedBanner.type === 'notification' && 'THÔNG BÁO'}
                    {selectedBanner.type === 'promotion' && 'KHUYẾN MÃI'}
                    {selectedBanner.type === 'blog' && 'BLOG'}
                    {selectedBanner.type === 'advertisement' && 'QUẢNG CÁO'}
                  </span>
                </div>
                
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={`status-badge ${selectedBanner.isActive ? 'active' : 'inactive'}`}>
                    {selectedBanner.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                </div>
                
                <div className="info-row">
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedBanner.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                
                <div className="info-row">
                  <label>Ngày cập nhật:</label>
                  <span>{new Date(selectedBanner.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
                
                {selectedBanner.content && (
                  <div className="info-row content-row">
                    <label>Nội dung:</label>
                    <div className="content-text">{selectedBanner.content}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn outline" onClick={closeDetailModal}>
                Đóng
              </button>
              <button className="btn primary" onClick={() => {
                handleEdit(selectedBanner)
                closeDetailModal()
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}