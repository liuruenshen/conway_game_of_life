import { Server } from 'socket.io';
import { roomHandler } from './handlers/roomHandler';
import { playerOperations } from './handlers/playerOperations';
import { TESTING_WS_PORT, WS_PORT } from './constant';
import * as Type from '../interface';

const io = new Server({ cors: { origin: '*' } });

io.on('connection', (socket) => {
  roomHandler(io, socket as Type.IOSocket);
  playerOperations(io, socket as Type.IOSocket);
});

const LISTENING_PORT =
  process.env.NODE_ENV === 'test' ? TESTING_WS_PORT : WS_PORT;

io.listen(LISTENING_PORT);

console.log(`WebSocket Server start serving on ${LISTENING_PORT}`);
