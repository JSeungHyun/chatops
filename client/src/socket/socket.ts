import { io, Socket } from 'socket.io-client';

// TODO: Configure Socket.io connection (Stage 2)
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
