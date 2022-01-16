/* eslint @typescript-eslint/no-explicit-any: "off" */
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Server, Socket } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';

export type IOServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;
export type IOSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export type IOClientSocket = ClientSocket<DefaultEventsMap, DefaultEventsMap>;

export type SocketEventHandlers = (server: IOServer, socket: IOSocket) => void;
export type SocketEvenEmitter<Arg> = (
  server: IOServer,
  socket: IOSocket,
  arg: Arg
) => void;

export interface CreateRoomPayload {
  roomName: string;
}

export interface JoinRoomPayload {
  roomName: string;
}

export interface RoomJoinedPayload {
  roomName: string;
  id: string;
}

export interface InvalidPayload {
  eventName: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  upperLeft: Position;
  bottomRight: Position;
}

export interface Hsl {
  hue: number;
  saturation: number;
  light: number;
}

export interface SetupClientPayload {
  dimension: Dimension;
  appearance: Hsl;
}

export interface Player {
  id: string;
  requestStartSimulation: boolean;
}

export interface Guest {
  id: string;
}

export interface Cell<IsLiving extends boolean = false | true> {
  position: Position;
  isLiving: IsLiving;
  neighbors: Hsl[];
  appearance: Hsl;
}

export type LivingCells = Cell<true>[];

export interface Room {
  name: string;
  players: Record<string, Player>;
  guests: Record<string, Guest>;
  livingCells: Record<string, Cell<true>>;
}
