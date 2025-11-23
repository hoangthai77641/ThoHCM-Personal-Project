import { adminHttp, setAdminAuthToken } from './http';
import { initAdminSocket, disconnectAdminSocket, updateAdminSocketToken } from './socket';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role?: string;
    name?: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await adminHttp.post('/api/auth/login', { email, password });
  const data = res.data;
  const token = data.accessToken || data.token || data.serviceToken;
  if (!token) throw new Error('Missing access token in login response');
  setAdminAuthToken(token); // in-memory only
  initAdminSocket(token);
  return { token, user: data.user };
}

export async function logout() {
  try { await adminHttp.post('/api/auth/logout'); } catch (_) {}
  setAdminAuthToken(undefined);
  disconnectAdminSocket();
}

export async function getCurrentUser() {
  try {
    const res = await adminHttp.get('/api/users/me');
    return res.data.user || res.data;
  } catch (e) {
    return null;
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const res = await adminHttp.post('/api/auth/refresh');
    const newToken = res.data.accessToken || res.data.token || res.data.serviceToken;
    if (newToken) {
      setAdminAuthToken(newToken);
      updateAdminSocketToken(newToken);
      return newToken;
    }
  } catch (_) {}
  return null;
}
