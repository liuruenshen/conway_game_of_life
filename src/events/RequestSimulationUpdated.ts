import { BaseSocketEvent, BaseSocketEventProps } from './BaseSocketEvent';
import * as Type from '../server/interface';

import { InvalidPayload } from './InvalidPayload';
import { RoomJoined } from './RoomJoined';

import { pEvent } from '../utilities/pEvent';

const CLASS_IDENTIFIER = Symbol('RequestSimulationUpdated');

export class RequestSimulationUpdated extends BaseSocketEvent<
  'request-simulation',
  Type.RequestSimulationUpdatedPayload
> {
  #invalidPayload: InvalidPayload;
  #roomJoined: RoomJoined;

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
  }

  clientEmitEvent(): void {}

  serverEmitEvent(payload: Type.RequestSimulationUpdatedPayload): void {
    if (this.serverSocket) {
      this.serverSocket.emit(this.eventName, payload);
    }
  }

  clientEventHandler(payload: Type.RequestSimulationUpdatedPayload): void {
    if (!this.#roomJoined.data) {
      return;
    }

    const { newUser, roomStatus } = this.#roomJoined.data;
    if (!newUser || !roomStatus) {
      return;
    }

    if (this.#roomJoined.isPlayer(newUser) && newUser.id === payload.playerId) {
      newUser.requestStartSimulation = payload.requestSimulation;
    }

    const foundPlayer = roomStatus.players.find(
      (player) => player.id === payload.playerId
    );

    if (foundPlayer) {
      foundPlayer.requestStartSimulation = payload.requestSimulation;
    }
  }

  serverEventHandler(): void {}

  promisifyEvent(): Promise<Type.RequestSimulationUpdatedPayload> {
    return pEvent<Type.RequestSimulationUpdatedPayload>(
      this.socket,
      this.eventName,
      {
        rejectEvents: [this.#invalidPayload.eventName],
      }
    );
  }

  getClassIdentifer() {
    return CLASS_IDENTIFIER;
  }

  static get classIdentifier() {
    return CLASS_IDENTIFIER;
  }
}
