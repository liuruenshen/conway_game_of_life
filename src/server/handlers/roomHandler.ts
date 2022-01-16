import * as Type from '../interface';
import { CreateRoom } from '../../events/CreateRoom';
import { JoinRoom } from '../../events/JoinRoom';
import { LeaveRoom } from '../../events/LeaveRoom';

const roomHandler: Type.SocketEventHandlers = (server, socket) => {
  new CreateRoom({
    server,
    serverSocket: socket,
  });

  new JoinRoom({
    server,
    serverSocket: socket,
  });

  new LeaveRoom({
    server,
    serverSocket: socket,
  });
};

export { roomHandler };
