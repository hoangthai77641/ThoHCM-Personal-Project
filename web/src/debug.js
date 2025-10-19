console.log('=== THOHCM DEBUG INFO ===')
console.log('Environment:', import.meta.env.MODE)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('Default API URL:', 'https://thohcm-application-475603.as.r.appspot.com')

// Log actual API calls
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('FETCH REQUEST:', args[0])
  return originalFetch.apply(this, args)
}

// Also log axios requests
import axios from 'axios'
axios.interceptors.request.use(config => {
  console.log('AXIOS REQUEST:', config.baseURL + config.url)
  return config
})