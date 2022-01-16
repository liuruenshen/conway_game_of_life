import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { InvalidPayload } from './InvalidPayload';
import * as Type from '../interface';
import { pEvent } from '../../utilities/pEvent';

import { DEFAULT_DIMENSION, GameOfLife } from '../../core/GameOfLife';

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

    this.#invalidPayload = new InvalidPayload(props);
  }

  clientEmitEvent(): void {}

  serverEmitEvent(): void {
    const payload: Type.SetupClientPayload = {
      dimension: DEFAULT_DIMENSION,
      appearance: GameOfLife.randomHsl,
    };

    this.serverSocket?.emit(this.eventName, payload);
  }

  clientEventHandler(): void {}

  serverEventHandler(): void {}

  promisifyEvent(): Promise<Type.SetupClientPayload> {
    return pEvent(this.socket, this.eventName, {
      rejectEvents: [this.#invalidPayload.eventName],
    });
  }
}
