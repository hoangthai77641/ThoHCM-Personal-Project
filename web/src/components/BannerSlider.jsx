import React, { useState, useEffect } from 'react'
import api from '../api'

export default function BannerSlider() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 4000) // Auto slide every 4 seconds

      return () => clearInterval(interval)
    }
  }, [banners.length])

  const loadBanners = async () => {
    try {
      const response = await api.get('/api/banners/active')
      setBanners(response.data || [])
    } catch (error) {
      console.error('Error loading banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/800x300/E5E7EB/6B7280?text=Thợ+HCM'
    if (imagePath.startsWith('http')) return imagePath
    return `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${imagePath}`
  }

  if (loading) {
    return (
      <div className="banner-slider loading">
        <div className="banner-placeholder">
          <div className="skeleton" style={{width: '100%', height: '200px', borderRadius: '12px'}} />
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null // Don't show anything if no banners
  }

  return (
    <div className="banner-slider">
      <div className="banner-container">
        {banners.map((banner, index) => (
          <div 
            key={banner._id} 
            className={`banner-slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${getImageUrl(banner.imageUrl)})`,
            }}
          >
            <div className="banner-overlay">
              <div className="banner-content">
                {banner.title && (
                  <h2 className="banner-title">{banner.title}</h2>
                )}
                {banner.content && (
                  <p className="banner-description">{banner.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {banners.length > 1 && (
          <div className="banner-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
        
        {banners.length > 1 && (
          <>
            <button 
              className="banner-nav prev"
              onClick={() => setCurrentIndex((prev) => 
                prev === 0 ? banners.length - 1 : prev - 1
              )}
            >
              ‹
            </button>
            <button 
              className="banner-nav next"
              onClick={() => setCurrentIndex((prev) => 
                (prev + 1) % banners.length
              )}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  )
}