import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token?: string) {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
  socket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    auth: token ? { token } : undefined
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}

export function updateSocketToken(token: string) {
  if (socket) {
    socket.auth = { token };
    // If connected, force a reconnect to apply new auth
    if (socket.connected) {
      socket.disconnect();
      socket.connect();
    }
  }
}
