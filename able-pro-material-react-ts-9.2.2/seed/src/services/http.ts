import axios from 'axios';
import { refreshToken } from './auth';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const http = axios.create({
  baseURL: apiBase,
  withCredentials: true
});

export function setAuthToken(token?: string) {
  // Keep Authorization header for backward compatibility (will be removed when server exclusively uses cookies)
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common['Authorization'];
  }
}

export async function getHealth() {
  const res = await http.get('/api/health');
  return res.data;
}

let refreshInFlight: Promise<string | null> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!refreshInFlight) {
        refreshInFlight = refreshToken().finally(() => {
          refreshInFlight = null;
        });
      }
      const newToken = await refreshInFlight;
      if (newToken) {
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return http.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Passive refresh every 4 minutes (slightly below 5m expiry) to keep session alive
setInterval(() => {
  if (!refreshInFlight) {
    refreshInFlight = refreshToken().finally(() => { refreshInFlight = null; });
  }
}, 4 * 60 * 1000);
