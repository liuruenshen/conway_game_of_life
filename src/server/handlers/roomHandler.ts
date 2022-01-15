import * as Type from '../interface';
import { CreateRoom } from '../events/CreateRoom';
import { JoinRoom } from '../events/JoinRoom';

const roomHandler: Type.SocketEventHandlers = (server, socket) => {
  const createRoom = new CreateRoom({
    server,
    serverSocket: socket,
  });

  const joinRoom = new JoinRoom({
    server,
    serverSocket: socket,
  });

  createRoom.severAttatchEvent();
  joinRoom.severAttatchEvent();
};

export { roomHandler };
