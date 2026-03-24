import { io } from 'socket.io-client';
import { HOST_API_KEY } from '../config';

const URL = HOST_API_KEY;

export const socket = io(URL, {
  autoConnect: false,
});
