import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { RoomNamesUpdated } from './RoomNamesUpdated';

const CLASS_IDENTIFIER = Symbol('GetRoomNames');

export class GetRoomNames extends BaseSocketEvent<'get-room-names', void> {
  #roomNameUpdated: RoomNamesUpdated;

  constructor(
    props: Omit<BaseSocketEventProps<'get-room-names'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'get-room-names',
    });

    this.#roomNameUpdated = new RoomNamesUpdated(props);
  }

  clientEmitEvent(): void {
    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(): void {
    this.#roomNameUpdated.serverEmitEvent();
  }

  promisifyEvent(): Promise<void> {
    return this.rejectUnimplementedPromisify();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
