import { io } from 'socket.io-client';

import * as Type from '../../interface';
import { AddLivingCells } from '../../events/AddLivingCells';
import { RemoveLivingCells } from '../../events/RemoveLivingCells';
import { RequestSimulation } from '../../events/RequestSimulation';
import { GetRoomNames } from '../../events/GetRoomNames';
import { RoomNamesUpdated } from '../../events/RoomNamesUpdated';
import { RequestSimulationUpdated } from '../../events/RequestSimulationUpdated';
import { CreateRoom } from '../../events/CreateRoom';
import { LivingCellsUpdated } from '../../events/LivingCellsUpdated';
import { JoinRoom } from '../../events/JoinRoom';
import { RoomJoined } from '../../events/RoomJoined';
import { LeaveRoom } from '../../events/LeaveRoom';
import { RoomLeaved } from '../../events/RoomLeaved';
import { SetupClientEnv } from '../../events/SetupClientEnv';

import { pEvent } from '../../utilities/pEvent';

import { WS_PORT } from '../../server/constant';

const socket = io(`http://localhost:${WS_PORT}`) as Type.IOClientSocket;

new CreateRoom({ clientSocket: socket });
new JoinRoom({ clientSocket: socket });
new RoomJoined({ clientSocket: socket });
new AddLivingCells({ clientSocket: socket });
new RemoveLivingCells({ clientSocket: socket });
new RequestSimulation({ clientSocket: socket });
new LivingCellsUpdated({ clientSocket: socket });
new RequestSimulationUpdated({ clientSocket: socket });
new GetRoomNames({ clientSocket: socket });
new RoomNamesUpdated({ clientSocket: socket });
new SetupClientEnv({ clientSocket: socket });
new RoomLeaved({ clientSocket: socket });

type ConnectFailedCallback = (error: string) => void;

let connectFailedCallback: ConnectFailedCallback = () => {};

export function setupConnectionFailedCallback(callback: ConnectFailedCallback) {
  connectFailedCallback = callback;
}

async function connectSocket() {
  if (!socket.connected) {
    socket.connect();

    try {
      await pEvent(socket, 'connect', {
        rejectEvents: ['disconnect', 'connect_error'],
      });
    } catch (e) {
      if (e instanceof Error) {
        connectFailedCallback(e.message);
      }
    }
  }
}

export async function createRoom(roomName: string) {
  await connectSocket();
  const instance = socket[CreateRoom.classIdentifier] as CreateRoom;
  instance.clientEmitEvent({
    roomName,
  });
}

export async function joinRoom(roomName: string) {
  await connectSocket();
  const instance = socket[JoinRoom.classIdentifier] as JoinRoom;
  instance.clientEmitEvent({
    roomName,
  });
}

export async function leaveRoom() {
  await connectSocket();
  const instance = socket[LeaveRoom.classIdentifier] as LeaveRoom;
  instance.clientEmitEvent();
}

export async function isRoomJoined() {
  await connectSocket();
  const instance = socket[RoomJoined.classIdentifier] as RoomJoined;

  if (!instance.data) {
    return false;
  }

  if (!instance.data.roomStatus) {
    return false;
  }

  return instance.data.roomStatus.players.some(
    (player) => player.id === socket.id
  );
}

export async function roomJoined(
  callback: (payload: Type.RoomJoinedPayload) => void
) {
  await connectSocket();
  const instance = socket[RoomJoined.classIdentifier] as RoomJoined;
  while (socket.connected) {
    callback(await instance.promisifyEvent());
  }
}

export async function roomLeaved(
  callback: (data: Type.RoomJoinedPayload['roomStatus'] | null) => void
) {
  await connectSocket();

  const instance = socket[RoomLeaved.classIdentifier] as RoomLeaved;
  const roomJoinedInstance = socket[RoomJoined.classIdentifier] as RoomJoined;

  while (socket.connected) {
    await instance.promisifyEvent();
    callback({
      ...(roomJoinedInstance.data?.roomStatus || { players: [], guests: [] }),
    });
  }
}

export async function getRoomStatus() {
  await connectSocket();
  const instance = socket[RoomJoined.classIdentifier] as RoomJoined;
  return instance.data?.roomStatus;
}

export async function addLivingCells(positions: Type.Position[]) {
  await connectSocket();
  const instance = socket[AddLivingCells.classIdentifier] as AddLivingCells;
  instance.clientEmitEvent(positions);
}

export async function removeLivingCells(positions: Type.Position[]) {
  await connectSocket();
  const instance = socket[
    RemoveLivingCells.classIdentifier
  ] as RemoveLivingCells;
  instance.clientEmitEvent(positions);
}

export async function livingCellsUpdated(
  callback: (payload: Type.LivingCellsUpdatedPayload) => void
) {
  await connectSocket();
  const instance = socket[
    LivingCellsUpdated.classIdentifier
  ] as LivingCellsUpdated;

  while (socket.connected) {
    callback(await instance.promisifyEvent());
  }
}

export async function requestSimulation(startSimulation: boolean) {
  await connectSocket();
  const instance = socket[
    RequestSimulation.classIdentifier
  ] as RequestSimulation;
  instance.clientEmitEvent(startSimulation);
}

export async function requestSimulationUpdated(
  callback: (payload: Type.RequestSimulationPayload) => void
) {
  await connectSocket();

  const instance = socket[
    RequestSimulationUpdated.classIdentifier
  ] as RequestSimulationUpdated;

  while (socket.connected) {
    callback(await instance.promisifyEvent());
  }
}

export async function getRoomNames() {
  await connectSocket();

  const instance = socket[GetRoomNames.classIdentifier] as GetRoomNames;
  instance.clientEmitEvent();
}

export async function roomNamesUpdated(
  callback: (payload: Type.RoomNamesUpdatedPayload) => void
) {
  await connectSocket();

  const instance = socket[RoomNamesUpdated.classIdentifier] as RoomNamesUpdated;

  while (socket.connected) {
    callback(await instance.promisifyEvent());
  }
}

export async function processClientEnv(
  callback: (payload: Type.SetupClientPayload) => void
) {
  await connectSocket();

  const instance = socket[SetupClientEnv.classIdentifier] as SetupClientEnv;

  while (socket.connected) {
    callback(await instance.promisifyEvent());
  }
}

export async function getClientEnv() {
  await connectSocket();

  const instance = socket[SetupClientEnv.classIdentifier] as SetupClientEnv;

  return instance.data;
}
