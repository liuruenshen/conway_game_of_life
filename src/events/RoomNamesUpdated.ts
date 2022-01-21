import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../interface';
import { getRoomNames } from '../modules/room';

import { pEvent } from '../utilities/pEvent';

const CLASS_IDENTIFIER = Symbol('RoomNamesUpdated');

export class RoomNamesUpdated extends BaseSocketEvent<
  'room-names-updated',
  Type.RoomNamesUpdatedPayload
> {
  constructor(
    props: Omit<BaseSocketEventProps<'room-names-updated'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'room-names-updated',
    });

    this.serverEmitEvent();
  }

  clientEmitEvent(): void {}

  serverEmitEvent() {
    if (this.serverSocket) {
      const payload: Type.RoomNamesUpdatedPayload = {
        roomNames: getRoomNames(),
      };
      this.serverSocket.emit(this.eventName, payload);
    }
  }

  clientEventHandler(data: Type.RoomNamesUpdatedPayload): void {
    this.data = data;
  }

  serverEventHandler(): void {}

  async promisifyEvent(): Promise<Type.RoomNamesUpdatedPayload> {
    return pEvent<Type.RoomNamesUpdatedPayload>(this.socket, this.eventName, {
      rejectEvents: ['disconnect'],
    });
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
