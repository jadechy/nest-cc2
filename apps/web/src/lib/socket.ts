import { io } from 'socket.io-client';

export const socket = io('http://localhost:3001/message', {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('🔗 Connecté :', socket.id);
});
