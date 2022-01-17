import isString from 'lodash/isString';

import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../utilities/EnhancedLodash';
import * as Type from '../interface';
import { removePlayer, removeGuest, findRoomByUserId } from '../modules/room';

import { RoomJoined } from './RoomJoined';
import { InvalidPayload } from './InvalidPayload';
import { pEvent } from '../utilities/pEvent';

const CLASS_IDENTIFIER = Symbol('RoomLeaved');

export class RoomLeaved extends BaseSocketEvent<
  'room-leaved',
  Type.RoomLeavedPayload
> {
  #roomJoined: RoomJoined;
  #invalidPayload: InvalidPayload;

  constructor(props: Omit<BaseSocketEventProps<'room-leaved'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'room-leaved',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );

    this.#roomJoined = this.getOrSetAttatchedEventSocket(RoomJoined, props);
    if (this.serverSocket) {
      this.serverSocket.on('disconnect', () => {
        if (!this.serverSocket) {
          return;
        }

        const roomName = findRoomByUserId(this.serverSocket.id);
        if (!roomName) {
          return;
        }

        this.serverEmitEvent({
          roomName,
          leavedUser: { id: this.serverSocket.id },
        });
      });
    }
  }

  static isRoomLeavedPayload(payload: unknown) {
    return (
      isPlainObject<Type.RoomLeavedPayload>(payload) &&
      isString(payload.roomName) &&
      isPlainObject<Type.RoomLeavedPayload['leavedUser']>(payload.leavedUser) &&
      isString(payload.leavedUser.id)
    );
  }

  clientEmitEvent(): void {}

  serverEmitEvent(payload: Type.RoomLeavedPayload) {
    removePlayer(payload.roomName, payload.leavedUser.id);
    removeGuest(payload.roomName, payload.leavedUser.id);

    this.server?.in(payload.roomName).emit(this.eventName, payload);
  }

  clientEventHandler(payload: Type.RoomLeavedPayload): void {
    if (!RoomLeaved.isRoomLeavedPayload(payload)) {
      return;
    }

    if (!this.#roomJoined.data || !this.#roomJoined.data.roomStatus) {
      return;
    }

    this.#roomJoined.data.roomStatus.players =
      this.#roomJoined.data.roomStatus.players.filter(
        (player) => player.id !== payload.leavedUser.id
      );

    this.#roomJoined.data.roomStatus.guests =
      this.#roomJoined.data.roomStatus.guests.filter(
        (guest) => guest.id !== payload.leavedUser.id
      );
  }

  serverEventHandler(): void {}

  async promisifyEvent() {
    return pEvent<Type.RoomLeavedPayload>(this.socket, this.eventName, {
      rejectEvents: [this.#invalidPayload.eventName],
    });
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
