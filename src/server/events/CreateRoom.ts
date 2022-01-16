import isString from 'lodash/isString';

import { isPlainObject } from '../../utilities/EnhancedLodash';
import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../interface';
import { addRoom } from '../../modules/room';

import { InvalidPayload } from './InvalidPayload';
import { JoinRoom } from './JoinRoom';

const CLASS_IDENTIFIER = Symbol('CreateRoom');

export class CreateRoom extends BaseSocketEvent<
  'create-room',
  Type.CreateRoomPayload
> {
  #invalidPayload: InvalidPayload;
  #joinRoom: JoinRoom;

  constructor(props: Omit<BaseSocketEventProps<'create-room'>, 'eventName'>) {
    super({
      ...props,
      eventName: 'create-room',
    });

    this.#invalidPayload = new InvalidPayload(props);
    this.#joinRoom = new JoinRoom(props);
  }

  clientEmitEvent(payload: Type.CreateRoomPayload): void {
    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName, payload);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(payload: Type.CreateRoomPayload): void {
    if (!this.isCreateRoomPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({
        eventName: this.eventName,
      });

      return;
    }

    const { roomName } = payload;
    addRoom(roomName);
    this.#joinRoom.joinRoom(roomName);
  }

  isCreateRoomPayload(payload: unknown) {
    return (
      isPlainObject<Type.CreateRoomPayload>(payload) &&
      isString(payload.roomName)
    );
  }

  promisifyEvent(): Promise<Type.CreateRoomPayload> {
    return this.rejectUnimplementedPromisify();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
