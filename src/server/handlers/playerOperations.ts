import * as Type from '../interface';
import { AddLivingCells } from '../../events/AddLivingCells';
import { RemoveLivingCells } from '../../events/RemoveLivingCell';
import { RequestSimulation } from '../../events/RequestSimulation';

const playerOperations: Type.SocketEventHandlers = (server, socket) => {
  new AddLivingCells({
    server,
    serverSocket: socket,
  });

  new RemoveLivingCells({
    server,
    serverSocket: socket,
  });

  new RequestSimulation({
    server,
    serverSocket: socket,
  });
};

export { playerOperations };
