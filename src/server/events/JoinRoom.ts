import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../../utilities/EnhancedLodash';
import isString from 'lodash/isString';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';
import { SetupClientEnv } from './SetupClientEnv';

import { pEvent } from '../../utilities/pEvent';
import {
  getRoom,
  addPlayer,
  addGuest,
  isRunningSimulation,
} from '../../modules/room';
import * as Type from '../interface';

export class JoinRoom extends BaseSocketEvent<
  'join-room',
  Type.JoinRoomPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;
  #setupClientEnv: SetupClientEnv;

  constructor(props: Omit<BaseSocketEventProps<'join-room'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'join-room',
    });

    this.#invalidPayload = new InvalidPayload(props);
    this.#roomJoined = new RoomJoined(props);
    this.#setupClientEnv = new SetupClientEnv(props);
  }

  isJoinRoomPayload(payload: unknown) {
    return (
      isPlainObject<Type.JoinRoomPayload>(payload) && isString(payload.roomName)
    );
  }

  clientEmitEvent(payload: Type.JoinRoomPayload): void {
    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName, payload);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(payload: Type.JoinRoomPayload): void {
    if (!this.isJoinRoomPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({ eventName: this.eventName });
      return;
    }

    this.joinRoom(payload.roomName);
  }

  async promisifyEvent(): Promise<Type.JoinRoomPayload> {
    const [data] = await pEvent<Type.JoinRoomPayload[]>(
      this.socket,
      this.eventName
    );
    return data;
  }

  joinRoom(roomName: string) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    if (isRunningSimulation(roomName)) {
      addGuest(roomName, { id: this.socket.id });
    } else {
      addPlayer(roomName, { id: this.socket.id });
    }

    this.serverSocket?.join(roomName);
    this.#roomJoined.serverEmitEvent({
      roomName,
      id: this.serverSocket?.id || '',
    });

    this.#setupClientEnv.serverEmitEvent();
  }
}
