import { Server } from 'socket.io';
import { roomHandler } from './handlers/roomHandler';
import { TESTING_WS_PORT, WS_PORT } from './constant';

const io = new Server({ cors: { origin: '*' } });

io.on('connection', (socket) => {
  roomHandler(io, socket);
});

const LISTENING_PORT =
  process.env.NODE_ENV === 'test' ? TESTING_WS_PORT : WS_PORT;

io.listen(LISTENING_PORT);

console.log(`WebSocket Server start serving on ${LISTENING_PORT}`);