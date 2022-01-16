import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { pEvent } from '../../utilities/pEvent';
import * as Type from '../interface';

const CLASS_IDENTIFIER = Symbol('InvalidPayload');

export class InvalidPayload extends BaseSocketEvent<
  'invalid-payload',
  Type.InvalidPayload
> {
  constructor(
    props: Omit<BaseSocketEventProps<'invalid-payload'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'invalid-payload',
    });
  }

  clientEmitEvent(): void {
    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName);
    }
  }

  serverEmitEvent(payload: Type.InvalidPayload): void {
    if (this.serverSocket) {
      this.serverSocket.emit(this.eventName, payload);
    }
  }

  async promisifyEvent(): Promise<Type.InvalidPayload> {
    return pEvent<Type.InvalidPayload>(this.socket, this.eventName);
  }

  serverEventHandler(): void {}

  clientEventHandler(): void {}

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
