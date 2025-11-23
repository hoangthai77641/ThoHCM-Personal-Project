import { io, Socket } from 'socket.io-client';

let adminSocket: Socket | null = null;

export function initAdminSocket(token?: string) {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
  adminSocket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    auth: token ? { token } : undefined
  });
  return adminSocket;
}

export function getAdminSocket() {
  return adminSocket;
}

export function disconnectAdminSocket() {
  if (adminSocket) adminSocket.disconnect();
}

export function updateAdminSocketToken(token: string) {
  if (adminSocket) {
    adminSocket.auth = { token };
    if (adminSocket.connected) {
      adminSocket.disconnect();
      adminSocket.connect();
    }
  }
}
