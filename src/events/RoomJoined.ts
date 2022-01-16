import isString from 'lodash/isString';

import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../utilities/EnhancedLodash';
import * as Type from '../server/interface';
import { getGuests, getPlayers } from '../modules/room';
import { getFlattenPromise } from '../utilities/getFlattenPromise';
import { isPromisePending } from '../utilities/isPromisePending';

import { InvalidPayload } from './InvalidPayload';
import { pEvent } from '../utilities/pEvent';

const CLASS_IDENTIFIER = Symbol('RoomJoined');

export class RoomJoined extends BaseSocketEvent<
  'room-joined',
  Type.RoomJoinedPayload
> {
  #invalidPayload: InvalidPayload;
  #newUser: Type.RoomJoinedPayload['newUser'][] = [];
  #roomJoinedPromise = getFlattenPromise<Type.RoomJoinedPayload>();

  constructor(props: Omit<BaseSocketEventProps<'room-joined'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'room-joined',
    });

    this.#invalidPayload = new InvalidPayload(props);
  }

  static isRoomJoinedPayload(payload: unknown) {
    return (
      isPlainObject<Type.RoomJoinedPayload>(payload) &&
      isString(payload.roomName)
    );
  }

  clientEmitEvent(): void {}

  isPlayer(data: unknown): data is Type.Player {
    return (
      isPlainObject<Type.Player>(data) &&
      isPlainObject<Type.Hsl>(data.appearance)
    );
  }

  serverEmitEvent(payload: Type.RoomJoinedPayload) {
    const newUser: Type.RoomJoinedPayload = { ...payload, roomStatus: null };

    this.server?.in(payload.roomName).emit(this.eventName, newUser);

    const roomPlayers = getPlayers(payload.roomName);
    const roomGuests = getGuests(payload.roomName);

    const roomStatus: Type.RoomJoinedPayload = {
      ...payload,
      newUser: null,
      roomStatus: {
        players: roomPlayers || [],
        guests: roomGuests || [],
      },
    };
    this.serverSocket?.emit(this.eventName, roomStatus);
  }

  clientEventHandler(data: Type.RoomJoinedPayload): void {
    if (data.newUser) {
      this.#newUser.push(data.newUser);
    } else {
      this.data = {
        ...data,
        roomStatus: {
          players: data.roomStatus?.players || [],
          guests: data.roomStatus?.guests || [],
        },
      };
    }

    if (this.data) {
      this.#newUser.forEach((user) => {
        if (!user) {
          return;
        }

        if (user.id === this.socket.id) {
          this.data!.newUser = user;
        } else if (this.isPlayer(user)) {
          this.data!.roomStatus!.players.push(user);
        } else {
          this.data!.roomStatus!.guests.push(user);
        }
      });

      this.#newUser = [];
      this.#roomJoinedPromise.resolve(this.data);
    }
  }

  serverEventHandler(): void {}

  async promisifyEvent(): Promise<Type.RoomJoinedPayload> {
    if (await isPromisePending(this.#roomJoinedPromise.promise)) {
      return pEvent(this.socket, this.#roomJoinedPromise.promise, {
        rejectEvents: [this.#invalidPayload.eventName],
      });
    }

    return pEvent(this.socket, this.eventName, {
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
