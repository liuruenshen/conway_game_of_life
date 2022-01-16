import isString from 'lodash/isString';

import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../utilities/EnhancedLodash';

import { InvalidPayload } from './InvalidPayload';
import { RoomLeaved } from './RoomLeaved';
import { RoomJoined } from './RoomJoined';

import * as Type from '../server/interface';

const CLASS_IDENTIFIER = Symbol('LeaveRoom');

export class LeaveRoom extends BaseSocketEvent<
  'leave-room',
  Type.LeaveRoomPayload
> {
  #invalidPayload: InvalidPayload;
  #roomLeaved: RoomLeaved;
  #roomJoined: RoomJoined;

  constructor(props: Omit<BaseSocketEventProps<'leave-room'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'leave-room',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
    this.#roomLeaved = this.getOrSetAttatchedEventSocket(RoomLeaved, props);
    this.#roomJoined = this.getOrSetAttatchedEventSocket(RoomJoined, props);
  }

  isLeaveRoomPayload(payload: unknown) {
    return (
      isPlainObject<Type.LeaveRoomPayload>(payload) &&
      isString(payload.roomName)
    );
  }

  clientEmitEvent(): void {
    if (!this.#roomJoined.data || !this.#roomJoined.data.roomStatus) {
      return;
    }

    const roomName = this.#roomJoined.data.roomName;

    const payload: Type.LeaveRoomPayload = {
      roomName,
    };

    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName, payload);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(payload: Type.LeaveRoomPayload): void {
    if (!this.isLeaveRoomPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({ eventName: this.eventName });
      return;
    }

    this.leaveRoom(payload.roomName);
  }

  async promisifyEvent() {
    return this.rejectUnimplementedPromisify();
  }

  leaveRoom(roomName: string) {
    this.#roomLeaved.serverEmitEvent({
      roomName,
      leavedUser: {
        id: this.socket.id,
      },
    });

    this.serverSocket?.leave(roomName);
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
