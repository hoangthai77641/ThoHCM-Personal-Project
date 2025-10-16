import React, { useState, useEffect } from 'react'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../utils/messages'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const resetToken = location.state?.resetToken

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password')
    }
  }, [resetToken, navigate])

  const submit = async (e) => {
    e.preventDefault()
    
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới')
      return
    }

    if (newPassword.length < 6) {
      setError(UI_MESSAGES.FORMS.PASSWORD_MIN_LENGTH)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/api/users/reset-password', {
        resetToken: resetToken,
        newPassword: newPassword
      })

      // Show success message and redirect to login
      alert(UI_MESSAGES.USERS.PASSWORD_RESET_SUCCESS)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']

  return (
    <div className="booking-container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Tạo mật khẩu mới</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '60px', 
            marginBottom: '16px',
            color: '#16a34a'
          }}>🔓</div>
          <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={submit} className="form">
          <div className="field">
            <label>Mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="Nhập mật khẩu mới" 
                type={showPassword ? 'text' : 'password'}
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {newPassword && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: strengthColors[Math.max(0, passwordStrength - 1)],
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: strengthColors[Math.max(0, passwordStrength - 1)],
                  marginTop: '4px'
                }}>
                  {strengthLabels[Math.max(0, passwordStrength - 1)]}
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label>Xác nhận mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="Nhập lại mật khẩu mới" 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword && (
              <div style={{
                fontSize: '12px',
                marginTop: '4px',
                color: newPassword === confirmPassword ? '#16a34a' : '#ef4444'
              }}>
                {newPassword === confirmPassword ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
              </div>
            )}
          </div>
          
          <button 
            className="btn primary" 
            type="submit" 
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
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

        {/* Password requirements */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
            Yêu cầu mật khẩu:
          </div>
          <div style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.5' }}>
            • Ít nhất 6 ký tự<br />
            • Nên bao gồm chữ hoa, chữ thường và số<br />
            • Không sử dụng thông tin cá nhân dễ đoán
          </div>
        </div>

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