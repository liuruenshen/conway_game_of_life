import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { isPlainObject } from '../../utilities/EnhancedLodash';
import isString from 'lodash/isString';
import { pEvent } from '../../utilities/pEvent';
import * as Type from '../interface';

import { InvalidPayload } from './InvalidPayload';

export class RoomJoined extends BaseSocketEvent<
  'room-joined',
  Type.RoomJoinedPayload
> {
  #invalidPayload: InvalidPayload;

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

  serverEmitEvent(payload: Type.RoomJoinedPayload) {
    this.server?.in(payload.roomName).emit(this.eventName, payload);
  }

  clientEventHandler(): void {}

  serverEventHandler(): void {}

  async promisifyEvent(): Promise<Type.RoomJoinedPayload> {
    return pEvent<Type.RoomJoinedPayload>(this.socket, this.eventName, {
      rejectEvents: [this.#invalidPayload.eventName],
    });
  }
}
