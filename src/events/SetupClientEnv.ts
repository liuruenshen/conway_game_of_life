import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import { InvalidPayload } from './InvalidPayload';
import * as Type from '../interface';
import { pileUpPromisesInitator } from '../utilities/pEvent';

import { DEFAULT_DIMENSION } from '../core/GameOfLife';

const CLASS_IDENTIFIER = Symbol('SetupClientEnv');

export class SetupClientEnv extends BaseSocketEvent<
  'setup-client-env',
  Type.SetupClientPayload
> {
  #invalidPayload: InvalidPayload;
  #pileUpPromise = pileUpPromisesInitator<Type.SetupClientPayload>();

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

  notifyDimensionChanged(roomName: string, payload: Type.SetupClientPayload) {
    this.server?.in(roomName).emit(this.eventName, payload);
  }

  clientEventHandler(data: Type.SetupClientPayload): void {
    this.data = data;
    this.#pileUpPromise.pileUp(data);
  }

  serverEventHandler(): void {}

  get bufferLength() {
    return this.#pileUpPromise.bufferLength();
  }

  promisifyEvent(): Promise<Type.SetupClientPayload> {
    return this.#pileUpPromise.fetch(this.socket, this.eventName, {
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
