import io from 'socket.io-client';

let socket = null;

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 
  (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

export const connectSocket = (userId) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_SERVER_URL, {
    query: { userId: userId || '' },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;