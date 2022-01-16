import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { InvalidPayload } from './InvalidPayload';
import * as Type from '../server/interface';
import { pEvent } from '../utilities/pEvent';

import { DEFAULT_DIMENSION } from '../core/GameOfLife';

const CLASS_IDENTIFIER = Symbol('SetupClientEnv');

export class SetupClientEnv extends BaseSocketEvent<
  'setup-client-env',
  Type.SetupClientPayload
> {
  #invalidPayload: InvalidPayload;

  constructor(
    props: Omit<BaseSocketEventProps<'setup-client-env'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'setup-client-env',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
  }

  clientEmitEvent(): void {}

  serverEmitEvent(): void {
    const payload: Type.SetupClientPayload = {
      dimension: DEFAULT_DIMENSION,
    };

    this.serverSocket?.emit(this.eventName, payload);
  }

  clientEventHandler(data: Type.SetupClientPayload): void {
    this.data = data;
  }

  serverEventHandler(): void {}

  promisifyEvent(): Promise<Type.SetupClientPayload> {
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
