import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AdministratorManagement() {
  const navigate = useNavigate()
  const me = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = me && me.role === 'admin'
  const apiBase = api.defaults.baseURL || ''
  
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { 
    if (!isAdmin) navigate('/') 
  }, [isAdmin, navigate])

  const params = useMemo(() => ({ q, page, limit }), [q, page, limit])

  const loadAdministrators = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/users/administrators', { params })
      let payload = res.data
      if (Array.isArray(payload)) {
        payload = { items: payload, total: payload.length, page: 1, pages: 1 }
      } else if (!payload || !Array.isArray(payload.items)) {
        payload = { items: [], total: 0, page: 1, pages: 1 }
      }
      setData(payload)
    } catch (e) { 
      setError(e.response?.data?.message || e.message)
    }
    finally { 
      setLoading(false) 
    }
  }, [isAdmin, params])

  useEffect(() => {
    loadAdministrators()
  }, [loadAdministrators])

  if (!isAdmin) {
    return <div>Không có quyền truy cập</div>
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý Quản trị viên</h1>
        <div className="page-stats">
          <span className="stat-item">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Tổng quản trị viên</span>
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 tìm theo tên, SĐT, địa chỉ..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="col-name">Tên</th>
              <th className="col-phone">Số điện thoại</th>
              <th className="col-address">Địa chỉ</th>
              <th className="col-avatar">Avatar</th>
              <th className="col-created">Ngày tạo</th>
              <th className="col-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map(admin => {
              const avatarUrl = admin.avatar
                ? (admin.avatar.startsWith('http') ? admin.avatar : `${apiBase}${admin.avatar}`)
                : null
              
              return (
                <tr key={admin._id}>
                  <td className="col-name">
                    <div className="admin-info">
                      <strong>{admin.name}</strong>
                      <span className="admin-badge">ADMIN</span>
                    </div>
                  </td>
                  <td className="col-phone">
                    <span className="phone-masked">
                      {admin.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                    </span>
                  </td>
                  <td className="col-address">{admin.address || '—'}</td>
                  <td className="col-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={`Avatar ${admin.name}`} className="avatar-thumb" />
                    ) : (
                      <div className="avatar-placeholder">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="col-created">
                    {new Date(admin.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="col-actions">
                    <div className="action-icons">
                      <button 
                        className="action-btn view"
                        title="Xem chi tiết"
                        onClick={() => {
                          alert(`Thông tin admin:\n- Tên: ${admin.name}\n- Phone: ${admin.phone}\n- Email: ${admin.email || 'Chưa có'}\n- Ngày tạo: ${new Date(admin.createdAt).toLocaleString('vi-VN')}`)
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.items.length === 0 && !loading && (
          <div className="empty-state">
            <p>Không tìm thấy quản trị viên nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>
          <span className="pagination-info">
            Trang {page} / {data.pages}
          </span>
          <button
            className="pagination-btn"
            disabled={page >= data.pages}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  )
}