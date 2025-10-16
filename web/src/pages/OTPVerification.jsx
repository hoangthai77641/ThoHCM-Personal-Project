import React, { useState, useEffect, useRef } from 'react'
import api from '../api'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(300) // 5 minutes
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef([])

  const phone = location.state?.phone
  const developmentOTP = location.state?.developmentOTP

  useEffect(() => {
    if (!phone) {
      navigate('/forgot-password')
      return
    }

    // Auto-fill OTP in development mode
    if (developmentOTP) {
      const otpArray = developmentOTP.split('')
      setOtp([...otpArray, ...Array(6 - otpArray.length).fill('')])
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phone, developmentOTP, navigate])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all fields are filled
    if (value && index === 5) {
      const completeOtp = newOtp.join('')
      if (completeOtp.length === 6) {
        verifyOTP(completeOtp)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOTP = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('')
    
    if (otpToVerify.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/api/users/verify-reset-otp', {
        phone: phone,
        otp: otpToVerify
      })

      if (res.data.resetToken) {
        navigate('/reset-password', { 
          state: { resetToken: res.data.resetToken } 
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không đúng')
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setResending(true)
    setError(null)

    try {
      const res = await api.post('/api/users/forgot-password', { phone })
      
      // Reset timer
      setRemainingSeconds(300)
      
      // Auto-fill OTP in development mode
      if (res.data.otp) {
        const otpArray = res.data.otp.split('')
        setOtp([...otpArray, ...Array(6 - otpArray.length).fill('')])
      }

      // Show success message briefly
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP')
    } finally {
      setResending(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSecs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return (
    <div className="booking-container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Nhập mã xác thực</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '60px', 
            marginBottom: '16px',
            color: '#2563eb'
          }}>📱</div>
          <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
            Mã OTP đã được gửi đến số điện thoại<br />
            <strong>{phone}</strong>
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); verifyOTP(); }} className="form">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '24px',
            gap: '8px'
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                style={{
                  width: '50px',
                  height: '60px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: `2px solid ${digit ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: loading ? '#f9fafb' : 'white'
                }}
              />
            ))}
          </div>

          {remainingSeconds > 0 && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Mã có hiệu lực trong {formatTime(remainingSeconds)}
            </div>
          )}
          
          <button 
            className="btn primary" 
            type="submit" 
            disabled={loading || otp.join('').length !== 6}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>
        </form>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {remainingSeconds === 0 && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              onClick={resendOTP}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: resending ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  )
}