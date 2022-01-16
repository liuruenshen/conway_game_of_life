import * as Type from '../server/interface';
import { GameOfLife } from '../core/GameOfLife';

const roomMap: Record<string, Type.Room> = {};

export function addRoom(roomName: string) {
  if (!hasRoom(roomName)) {
    roomMap[roomName] = {
      name: roomName,
      players: {},
      guests: {},
      livingCells: {},
    };

    return true;
  }

  return false;
}

export function hasPlayer(roomName: string, playerId: Type.Player['id']) {
  const room = getRoom(roomName);

  if (!room) {
    return false;
  }

  return !!room.players[playerId];
}

export function hasGuest(roomName: string, guestId: Type.Guest['id']) {
  const room = getRoom(roomName);

  if (!room) {
    return false;
  }

  return !!room.guests[guestId];
}

export function addPlayer(
  roomName: string,
  player: Omit<Type.Player, 'requestStartSimulation'>
) {
  const plyaerConfig: Type.Player = {
    ...player,
    requestStartSimulation: false,
  };

  if (!hasPlayer(roomName, player.id)) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    room.players[plyaerConfig.id] = plyaerConfig;
  }
}

export function removePlayer(roomName: string, playerId: Type.Player['id']) {
  if (hasPlayer(roomName, playerId)) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    delete room.players[playerId];
  }
}

export function addGuest(roomName: string, guest: Type.Guest) {
  const guestConfig: Type.Guest = {
    ...guest,
  };

  if (!hasGuest(roomName, guest.id)) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    room.guests[guestConfig.id] = guestConfig;
  }
}

export function removeGuest(roomName: string, guestId: Type.Guest['id']) {
  if (hasGuest(roomName, guestId)) {
    const room = getRoom(roomName);
    if (!room) {
      return;
    }

    delete room.guests[guestId];
  }
}

export function getRoomList() {
  return Object.entries(roomMap).map(([key, room]) => room);
}

export function hasRoom(roomName: string) {
  return !!roomMap[roomName];
}

export function getRoom(roomName: string): Type.Room | undefined {
  return roomMap[roomName];
}

export function removingLivingCell(roomName: string, oldCell: Type.Cell) {
  const room = getRoom(roomName);
  if (!room) {
    return;
  }

  delete room.livingCells[GameOfLife.getPositionKey(oldCell.position)];
}

export function addLivingCell(roomName: string, newCell: Type.Cell) {
  const addingCell: Type.Cell<true> = { ...newCell, isLiving: true };

  const room = getRoom(roomName);
  if (!room) {
    return;
  }

  removingLivingCell(roomName, addingCell);

  room.livingCells[GameOfLife.getPositionKey(addingCell.position)] = addingCell;
}

export function isRunningSimulation(roomName: string) {
  const room = getRoom(roomName);
  if (!room) {
    return;
  }

  return Object.entries(room.players)
    .map(([key, player]) => player)
    .reduce((result, player) => result && player.requestStartSimulation, true);
}
