import React from 'react'

const DebugInfo = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#fff',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      wordBreak: 'break-all'
    }}>
      <h4>Debug Info:</h4>
      <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'undefined'}</p>
      <p><strong>NODE_ENV:</strong> {import.meta.env.NODE_ENV}</p>
      <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
      <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}</p>
    </div>
  )
}

export default DebugInfo