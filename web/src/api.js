import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://thohcm-backend-181755246333.asia-southeast1.run.app'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10s timeout for requests to avoid hanging
})

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  
  // Add language header based on current language setting
  const language = localStorage.getItem('language') || 'vi'
  cfg.headers['Accept-Language'] = language
  
  // Also add as query parameter for API endpoints that need it
  if (!cfg.params) cfg.params = {}
  cfg.params.lang = language
  
  // For FormData, remove Content-Type header to let browser set it with boundary
  if (cfg.data instanceof FormData) {
    delete cfg.headers['Content-Type']
  }
  
  return cfg
})

export default client
