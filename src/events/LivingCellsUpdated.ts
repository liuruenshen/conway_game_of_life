import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../server/interface';

import { InvalidPayload } from './InvalidPayload';

import { pEvent } from '../utilities/pEvent';
import {
  getLivingCells,
  findRoomByUserId,
  runSimulation,
} from '../modules/room';
import { sleep } from '../utilities/sleep';

const CLASS_IDENTIFIER = Symbol('LivingCellsUpdated');

export class LivingCellsUpdated extends BaseSocketEvent<
  'living-cells-updated',
  Type.LivingCellsUpdatedPayload
> {
  #invalidPayload: InvalidPayload;

  constructor(
    props: Omit<BaseSocketEventProps<'living-cells-updated'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'living-cells-updated',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
  }

  clientEmitEvent(): void {}

  async startRunningSimulation() {
    if (!this.serverSocket) {
      return;
    }

    const roomName = findRoomByUserId(this.serverSocket.id);
    if (!roomName) {
      return;
    }

    const generator = runSimulation(roomName);

    for (const cells of generator) {
      this.serverEmitEvent({
        roomName,
        cells,
      });

      await sleep(500);
    }
  }

  updateLivingCell() {
    if (!this.serverSocket) {
      return;
    }

    const roomName = findRoomByUserId(this.serverSocket.id);
    if (!roomName) {
      return;
    }

    const cells = getLivingCells(roomName);
    if (!cells) {
      return;
    }

    this.serverEmitEvent({
      roomName,
      cells,
    });
  }

  serverEmitEvent(payload: Type.LivingCellsUpdatedPayload): void {
    if (this.serverSocket) {
      this.serverSocket.emit(this.eventName, payload);
    }
  }

  clientEventHandler(payload: Type.LivingCellsUpdatedPayload): void {
    this.data = payload;
  }

  serverEventHandler(): void {}

  promisifyEvent(): Promise<Type.LivingCellsUpdatedPayload> {
    return pEvent<Type.LivingCellsUpdatedPayload>(this.socket, this.eventName, {
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
