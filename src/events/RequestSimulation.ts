import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';

import { isPlainObject } from '../utilities/EnhancedLodash';
import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../interface';
import {
  requestRunningSimulation,
  requestStopSimulation,
} from '../modules/room';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';
import { RequestSimulationUpdated } from './RequestSimulationUpdated';
import { LivingCellsUpdated } from './LivingCellsUpdated';

const CLASS_IDENTIFIER = Symbol('RequestSimulation');

export class RequestSimulation extends BaseSocketEvent<
  'request-simulation',
  Type.RequestSimulationPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;
  #requestSimulationUpdated: RequestSimulationUpdated;
  #livingCellsUpdated: LivingCellsUpdated;

  constructor(
    props: Omit<BaseSocketEventProps<'request-simulation'>, 'eventName'>
  ) {
    super({
      ...props,
      eventName: 'request-simulation',
    });

    this.#invalidPayload = this.getOrSetAttatchedEventSocket(
      InvalidPayload,
      props
    );
    this.#roomJoined = this.getOrSetAttatchedEventSocket(RoomJoined, props);
    this.#requestSimulationUpdated = this.getOrSetAttatchedEventSocket(
      RequestSimulationUpdated,
      props
    );
    this.#livingCellsUpdated = this.getOrSetAttatchedEventSocket(
      LivingCellsUpdated,
      props
    );
  }

  isRequestSimulationPayload(
    data: unknown
  ): data is Type.RequestSimulationPayload {
    return (
      isPlainObject<Type.RequestSimulationPayload>(data) &&
      isString(data.playerId) &&
      isString(data.roomName) &&
      isBoolean(data.requestSimulation)
    );
  }

  clientEmitEvent(
    requestSimulation: boolean | Type.RequestSimulationPayload
  ): void {
    if (typeof requestSimulation !== 'boolean') {
      return;
    }

    const userInfo = this.#roomJoined.data?.newUser;
    const roomName = this.#roomJoined.data?.roomName;

    if (!userInfo || !this.#roomJoined.isPlayer(userInfo) || !roomName) {
      return;
    }

    const payload: Type.RequestSimulationPayload = {
      roomName,
      playerId: userInfo.id,
      requestSimulation,
    };

    if (this.clientSocket) {
      this.clientSocket.emit(this.eventName, payload);
    }
  }

  serverEmitEvent(): void {}

  clientEventHandler(): void {}

  serverEventHandler(payload: Type.CreateRoomPayload): void {
    if (!this.isRequestSimulationPayload(payload)) {
      this.#invalidPayload.serverEmitEvent({
        eventName: this.eventName,
      });

      return;
    }

    if (payload.requestSimulation) {
      if (requestRunningSimulation(payload.roomName, payload.playerId)) {
        this.#requestSimulationUpdated.serverEmitEvent(payload);
        this.#livingCellsUpdated.startRunningSimulation();
      }
    } else {
      if (requestStopSimulation(payload.roomName, payload.playerId)) {
        this.#requestSimulationUpdated.serverEmitEvent(payload);
      }
    }
  }

  promisifyEvent(): Promise<Type.RequestSimulationPayload> {
    return this.rejectUnimplementedPromisify();
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
