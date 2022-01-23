import isString from 'lodash/isString';

import { isPlainObject } from '../utilities/EnhancedLodash';
import { isPosition } from '../validator/isPosition';
import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../interface';
import { addLivingCell } from '../modules/room';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';
import { LivingCellsUpdated } from './LivingCellsUpdated';
import { isPlayer } from '../validator/isPlayer';

const CLASS_IDENTIFIER = Symbol('AddLivingCells');

export class AddLivingCells extends BaseSocketEvent<
  'add-living-cells',
  Type.AddLivingCellsPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;
  #livingCellsUpdated: LivingCellsUpdated;

  constructor(
    props: Omit<BaseSocketEventProps<'add-living-cells'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'add-living-cells',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
    this.#roomJoined = this.getOrSetAttatchedEventSocket(RoomJoined, props);
    this.#livingCellsUpdated = this.getOrSetAttatchedEventSocket(
      LivingCellsUpdated,
      props
    );
  }

  isAddLivingCellsPayload(data: unknown): data is Type.AddLivingCellsPayload {
    return (
      isPlainObject<Type.AddLivingCellsPayload>(data) &&
      isString(data.playerId) &&
      isString(data.roomName) &&
      Array.isArray(data.position) &&
      data.position.every((position) => isPosition(position))
    );
  }

  clientEmitEvent(
    position:
      | Type.AddLivingCellsPayload['position']
      | Type.AddLivingCellsPayload
  ): void {
    if (this.isAddLivingCellsPayload(position)) {
      return;
    }

    if (!this.#roomJoined.data) {
      return;
    }

    const { newUser, roomStatus, roomName } = this.#roomJoined.data;

    if (!newUser || !roomStatus || !isPlayer(newUser)) {
      return;
    }

    const payload: Type.AddLivingCellsPayload = {
      playerId: newUser.id,
      position,
      roomName,
    };

    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName, payload);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(payload: Type.CreateRoomPayload): void {
    if (!this.isAddLivingCellsPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({
        eventName: this.eventName,
      });

      return;
    }

    if (addLivingCell(payload.roomName, payload.playerId, payload.position)) {
      this.#livingCellsUpdated.updateLivingCell();
    }
  }

  promisifyEvent(): Promise<Type.AddLivingCellsPayload> {
    return this.rejectUnimplementedPromisify();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
