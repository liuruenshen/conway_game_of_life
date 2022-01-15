import * as Type from '../interface';

const invalidClientPayload: Type.SocketEvenEmitter<
  Type.InvalidClientPayload
> = (server, socket, arg) => {
  socket.to(socket.id).emit('invalid-client-payload', arg);
};

export { invalidClientPayload };
