const roomList: string[] = [];

export function addRoom(room: string) {
  if (!roomList.includes(room)) {
    roomList.push(room);
    return true;
  }

  return false;
}

export function getRoomList() {
  return [...roomList];
}

export function hasRoom(room: string) {
  return roomList.includes(room);
}
