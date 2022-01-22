import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../interface';

import { InvalidPayload } from './InvalidPayload';

import { pileUpPromisesInitator } from '../utilities/pEvent';
import {
  getLivingCells,
  findRoomByUserId,
  runSimulation,
  getRoom,
} from '../modules/room';
import { sleep } from '../utilities/sleep';

const CLASS_IDENTIFIER = Symbol('LivingCellsUpdated');

export class LivingCellsUpdated extends BaseSocketEvent<
  'living-cells-updated',
  Type.LivingCellsUpdatedPayload
> {
  #invalidPayload: InvalidPayload;
  #pileUpPromise = pileUpPromisesInitator<Type.LivingCellsUpdatedPayload>();

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

    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    const generator = runSimulation(roomName);

    for (const cells of generator) {
      this.serverEmitEvent({
        roomName,
        cells,
        simulationFrame: room.simulationFrame,
      });

      await sleep(500);
    }
  }

  updateLivingCell(updateItself = false) {
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

    if (updateItself) {
      if (this.serverSocket) {
        this.serverSocket.emit(this.eventName, { roomName, cells });
      }
    } else {
      this.serverEmitEvent({
        roomName,
        cells,
      });
    }
  }

  serverEmitEvent(payload: Type.LivingCellsUpdatedPayload): void {
    if (this.server) {
      this.server.in(payload.roomName).emit(this.eventName, payload);
    }
  }

  clientEventHandler(payload: Type.LivingCellsUpdatedPayload): void {
    this.data = payload;
    this.#pileUpPromise.pileUp(payload);
  }

  serverEventHandler(): void {}

  get bufferLength() {
    return this.#pileUpPromise.bufferLength();
  }

  promisifyEvent(): Promise<Type.LivingCellsUpdatedPayload> {
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
