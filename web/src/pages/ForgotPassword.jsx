import React, { useState } from 'react'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../utils/messages'
import { useNavigate, Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/api/users/forgot-password', { phone: phone.trim() })
      setMessage(res.data.message)
      
      // Navigate to OTP verification page after 2 seconds
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { 
            phone: phone.trim(),
            // Pass OTP for development mode
            developmentOTP: res.data.otp
          } 
        })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Quên mật khẩu</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '60px', 
            marginBottom: '16px',
            color: '#2563eb'
          }}>🔒</div>
          <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
            Nhập số điện thoại của bạn để nhận mã xác thực
          </p>
        </div>

        <form onSubmit={submit} className="form">
          <div className="field">
            <label>Số điện thoại</label>
            <input 
              placeholder="Nhập số điện thoại của bạn" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              type="tel"
              disabled={loading}
            />
          </div>
          
          <button 
            className="btn primary" 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? UI_MESSAGES.REVIEW.SUBMITTING_BUTTON : 'Gửi mã xác thực'}
          </button>
        </form>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            color: '#0369a1',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {message}
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
              Đang chuyển đến trang xác thực...
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}