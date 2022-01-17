import isString from 'lodash/isString';

import { isPlainObject } from '../utilities/EnhancedLodash';
import { isPosition } from '../validator/isPosition';
import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../server/interface';
import { removeLivingCell } from '../modules/room';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';
import { LivingCellsUpdated } from './LivingCellsUpdated';

const CLASS_IDENTIFIER = Symbol('RemoveLivingCells');

export class RemoveLivingCells extends BaseSocketEvent<
  'remove-living-cells',
  Type.RemoveLivingCellsPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;
  #livingCellsUpdated: LivingCellsUpdated;

  constructor(
    props: Omit<BaseSocketEventProps<'remove-living-cells'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'remove-living-cells',
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

  isRemoveLivingCellsPayload(
    data: unknown
  ): data is Type.RemoveLivingCellsPayload {
    return (
      isPlainObject<Type.RemoveLivingCellsPayload>(data) &&
      isString(data.playerId) &&
      isString(data.roomName) &&
      Array.isArray(data.position) &&
      data.position.every((position) => isPosition(position))
    );
  }

  clientEmitEvent(
    position:
      | Type.RemoveLivingCellsPayload['position']
      | Type.RemoveLivingCellsPayload
  ): void {
    if (this.isRemoveLivingCellsPayload(position)) {
      return;
    }

    if (!this.#roomJoined.data) {
      return;
    }

    const { newUser, roomStatus, roomName } = this.#roomJoined.data;

    if (!newUser || !roomStatus || !this.#roomJoined.isPlayer(newUser)) {
      return;
    }

    const payload: Type.RemoveLivingCellsPayload = {
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
    if (!this.isRemoveLivingCellsPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({
        eventName: this.eventName,
      });

      return;
    }

    if (removeLivingCell(payload.roomName, payload.position)) {
      this.#livingCellsUpdated.updateLivingCell();
    }
  }

  promisifyEvent(): Promise<Type.RemoveLivingCellsPayload> {
    return this.rejectUnimplementedPromisify();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
