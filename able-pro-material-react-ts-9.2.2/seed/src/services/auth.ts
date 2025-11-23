import { http, setAuthToken } from './http';
import { initSocket, disconnectSocket, updateSocketToken } from './socket';

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
  const res = await http.post('/api/auth/login', { email, password });
  const data = res.data;
  const token = data.accessToken || data.token || data.serviceToken;
  if (!token) throw new Error('Missing access token in login response');
  // Store ONLY in memory via axios default header (no localStorage persistence)
  setAuthToken(token);
  initSocket(token);
  return { token, user: data.user };
}

export async function logout() {
  try { await http.post('/api/auth/logout'); } catch (_) {}
  setAuthToken(undefined);
  disconnectSocket();
}

export async function getCurrentUser() {
  try {
    const res = await http.get('/api/users/me');
    return res.data.user || res.data;
  } catch (e) {
    return null;
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const res = await http.post('/api/auth/refresh');
    const newToken = res.data.accessToken || res.data.token || res.data.serviceToken;
    if (newToken) {
      setAuthToken(newToken);
      updateSocketToken(newToken);
      return newToken;
    }
  } catch (_) {}
  return null;
}
