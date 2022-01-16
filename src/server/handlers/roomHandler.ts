import * as Type from '../interface';
import { CreateRoom } from '../events/CreateRoom';
import { JoinRoom } from '../events/JoinRoom';

const roomHandler: Type.SocketEventHandlers = (server, socket) => {
  new CreateRoom({
    server,
    serverSocket: socket,
  });

  new JoinRoom({
    server,
    serverSocket: socket,
  });
};

export { roomHandler };
