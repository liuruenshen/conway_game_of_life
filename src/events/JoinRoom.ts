import isString from 'lodash/isString';

import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../utilities/EnhancedLodash';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';
import { SetupClientEnv } from './SetupClientEnv';

import {
  getRoom,
  addPlayer,
  addGuest,
  isRunningSimulation,
} from '../modules/room';
import * as Type from '../server/interface';

const CLASS_IDENTIFIER = Symbol('JoinRoom');

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

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
    this.#roomJoined = this.getOrSetAttatchedEventSocket(RoomJoined, props);
    this.#setupClientEnv = this.getOrSetAttatchedEventSocket(
      SetupClientEnv,
      props
    );
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

  async promisifyEvent() {
    return this.rejectUnimplementedPromisify();
  }

  joinRoom(roomName: string) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    let newUser: Type.Guest | Type.Player | null = null;
    if (isRunningSimulation(roomName)) {
      newUser = addGuest(roomName, { id: this.socket.id }) || null;
    } else {
      newUser = addPlayer(roomName, { id: this.socket.id }) || null;
    }

    if (!newUser) {
      return;
    }

    this.serverSocket?.join(roomName);
    this.#roomJoined.serverEmitEvent({
      roomName,
      roomStatus: null,
      newUser,
    });

    this.#setupClientEnv.serverEmitEvent();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
