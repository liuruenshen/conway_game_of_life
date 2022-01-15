import * as Type from '../interface';
import { isPlainObject } from '../../utilities/EnhancedLodash';
import isString from 'lodash/isString';
import { invalidClientPayload } from '../events/invalidClientPayload';

function isCreateRoomPayload(payload: unknown) {
  return (
    isPlainObject<Type.CreateRoomPayload>(payload) && isString(payload.roomName)
  );
}

function isJoinRoomPayload(payload: unknown) {
  return (
    isPlainObject<Type.JoinRoomPayload>(payload) && isString(payload.roomName)
  );
}

const roomList: string[] = [];

const roomHandler: Type.SocketEventHandlers = (server, socket) => {
  function joinRoom(room: string) {
    if (!roomList.includes(room)) {
      socket.emit('non-existing-room');
      return;
    }

    socket.join(room);
    socket.emit('room-joined');
  }

  socket.on('create-room', (payload: Type.CreateRoomPayload) => {
    if (!isCreateRoomPayload(payload)) {
      invalidClientPayload(server, socket, { eventName: 'create-room' });
      return;
    }

    const { roomName } = payload;
    if (!roomList.includes(roomName)) {
      roomList.push(roomName);
    }

    joinRoom(roomName);
  });

  socket.on('join-room', (payload: Type.JoinRoomPayload) => {
    if (!isJoinRoomPayload(payload)) {
      invalidClientPayload(server, socket, { eventName: 'join-room' });
      return;
    }

    const { roomName } = payload;
    joinRoom(roomName);
  });
};

export { roomHandler };
