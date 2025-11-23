import axios from 'axios';
import { refreshToken } from './auth';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const adminHttp = axios.create({
  baseURL: apiBase,
  withCredentials: true
});

export function setAdminAuthToken(token?: string) {
  if (token) {
    adminHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete adminHttp.defaults.headers.common['Authorization'];
  }
}

export async function getAdminHealth() {
  const res = await adminHttp.get('/api/health');
  return res.data;
}

// Response interceptor for 401 refresh
let refreshInFlight: Promise<string | null> | null = null;

adminHttp.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!refreshInFlight) {
        refreshInFlight = refreshToken().finally(() => { refreshInFlight = null; });
      }
      const newToken = await refreshInFlight;
      if (newToken) {
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return adminHttp.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Passive refresh slightly before expiry (4m < 5m)
setInterval(() => {
  if (!refreshInFlight) {
    refreshInFlight = refreshToken().finally(() => { refreshInFlight = null; });
  }
}, 4 * 60 * 1000);
