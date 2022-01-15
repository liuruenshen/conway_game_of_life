import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../../utilities/EnhancedLodash';
import isString from 'lodash/isString';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';

import { pEvent } from '../../utilities/pEvent';
import { hasRoom } from '../../modules/room';
import * as Type from '../interface';

export class JoinRoom extends BaseSocketEvent<
  'join-room',
  Type.JoinRoomPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;

  constructor(props: Omit<BaseSocketEventProps<'join-room'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'join-room',
    });

    this.#invalidPayload = new InvalidPayload(props);
    this.#roomJoined = new RoomJoined(props);
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

  joinRoom(room: string) {
    if (!hasRoom(room)) {
      return;
    }

    this.serverSocket?.join(room);
    this.#roomJoined.serverEmitEvent({
      roomName: room,
      id: this.serverSocket?.id || '',
    });
  }
}
