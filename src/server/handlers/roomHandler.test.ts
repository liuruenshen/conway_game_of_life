import { io } from 'socket.io-client';
import { TESTING_WS_PORT } from '../constant';
import { IOClientSocket, Hsl } from '../../interface';
import { pEvent, PEventRejectError } from '../../utilities/pEvent';
import { CreateRoom } from '../../events/CreateRoom';
import { RoomJoined } from '../../events/RoomJoined';
import { RoomLeaved } from '../../events/RoomLeaved';
import { LeaveRoom } from '../../events/LeaveRoom';
import { SetupClientEnv } from '../../events/SetupClientEnv';
import { JoinRoom } from '../../events/JoinRoom';
import { sleep } from '../../utilities/sleep';
import { isPromisePending } from '../../utilities/isPromisePending';

describe('Test room handler', () => {
  const sockets: IOClientSocket[] = [];

  beforeAll(async () => {
    const socket1 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;
    const socket2 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;
    const socket3 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;
    const socket4 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;

    await Promise.all([
      pEvent(socket1, 'connect'),
      pEvent(socket2, 'connect'),
      pEvent(socket3, 'connect'),
      pEvent(socket4, 'connect'),
    ]);

    sockets.push(socket1);
    sockets.push(socket2);
    sockets.push(socket3);
    sockets.push(socket4);
  });

  function validateHsl(data: Hsl) {
    expect(data.hue).toBeGreaterThanOrEqual(0);
    expect(data.hue).toBeLessThanOrEqual(360);
    expect(data.saturation).toBeGreaterThanOrEqual(0);
    expect(data.saturation).toBeLessThanOrEqual(100);
    expect(data.light).toBeGreaterThanOrEqual(30);
    expect(data.light).toBeLessThanOrEqual(100);
  }

  it('should send create-room event successfully', async () => {
    expect.assertions(16);

    sockets.forEach((socket) => {
      new CreateRoom({ clientSocket: socket });
      new RoomJoined({ clientSocket: socket });
      new SetupClientEnv({ clientSocket: socket });
      new RoomLeaved({ clientSocket: socket });
      new LeaveRoom({ clientSocket: socket });
    });

    (sockets[0][CreateRoom.classIdentifier] as CreateRoom).clientEmitEvent({
      roomName: 'room1',
    });

    const roomJoinedPromise = (
      sockets[0][RoomJoined.classIdentifier] as RoomJoined
    ).promisifyEvent();

    const setupClientEnvPromise = (
      sockets[0][SetupClientEnv.classIdentifier] as SetupClientEnv
    ).promisifyEvent();

    const roomJoinedResult = await roomJoinedPromise;

    expect(roomJoinedResult).toMatchObject({
      roomName: 'room1',
      newUser: {
        id: sockets[0].id,
        requestStartSimulation: false,
      },
      roomStatus: {
        players: [
          {
            id: sockets[0].id,
            requestStartSimulation: false,
          },
        ],
        guests: [],
      },
    });

    roomJoinedResult.roomStatus?.players.forEach((player) =>
      validateHsl(player.appearance)
    );

    // @ts-ignore
    validateHsl(roomJoinedResult.newUser?.appearance);

    expect(roomJoinedResult.newUser).toMatchObject(
      // @ts-ignore
      roomJoinedResult.roomStatus?.players[0]
    );

    expect(
      (sockets[0][RoomJoined.classIdentifier] as RoomJoined).data
    ).toMatchObject({
      roomName: 'room1',
      newUser: {
        id: sockets[0].id,
        requestStartSimulation: false,
      },
      roomStatus: {
        players: [
          {
            id: sockets[0].id,
            requestStartSimulation: false,
          },
        ],
        guests: [],
      },
    });

    const clientSettings = await setupClientEnvPromise;
    expect(clientSettings).toMatchObject({
      dimension: {
        upperLeft: { x: 0, y: 0 },
        bottomRight: { x: 99, y: 99 },
      },
    });
  });

  it('should receive invalid-payload event', async () => {
    expect.assertions(2);

    const createRoom = sockets[1][CreateRoom.classIdentifier] as CreateRoom;

    const roomJoinedList = sockets.map(
      (socket) => socket[RoomJoined.classIdentifier] as RoomJoined
    );

    // @ts-ignore
    createRoom.clientEmitEvent({ hello: '12344' });

    try {
      await roomJoinedList[1].promisifyEvent();
    } catch (e) {
      expect(e).toBeInstanceOf(PEventRejectError);
      expect((e as PEventRejectError).payload).toMatchObject({
        eventName: 'create-room',
      });
    }
  });

  it('should join the existing room successfully', async () => {
    expect.assertions(81);

    const joinRoomList = sockets.map(
      (socket) => socket[JoinRoom.classIdentifier] as JoinRoom
    );

    const roomJoinedList = sockets.map(
      (socket) => socket[RoomJoined.classIdentifier] as RoomJoined
    );

    const setupClientEnvList = sockets.map(
      (socket) => socket[SetupClientEnv.classIdentifier] as SetupClientEnv
    );

    joinRoomList[1].clientEmitEvent({ roomName: 'room1' });

    let promises = roomJoinedList.map((roomJoined, index) => {
      if (index === 0) {
        return roomJoined.promisifyEvent().then((data) => {
          expect(data).toMatchObject({
            newUser: {
              id: sockets[1].id,
              requestStartSimulation: false,
            },
            roomStatus: null,
          });

          // @ts-ignore
          validateHsl(data.newUser?.appearance);

          expect(roomJoined.data?.roomStatus).toMatchObject({
            players: [
              {
                id: sockets[0].id,
                requestStartSimulation: false,
              },
              {
                id: sockets[1].id,
                requestStartSimulation: false,
              },
            ],
            guests: [],
          });

          roomJoined.data?.roomStatus?.players.forEach((player) =>
            validateHsl(player.appearance)
          );
        });
      } else if (index === 1) {
        return roomJoined.promisifyEvent().then((data) => {
          expect(data).toMatchObject({
            newUser: {
              id: sockets[1].id,
              requestStartSimulation: false,
            },
            roomStatus: {
              players: [
                {
                  id: sockets[0].id,
                  requestStartSimulation: false,
                },
                {
                  id: sockets[1].id,
                  requestStartSimulation: false,
                },
              ],
              guests: [],
            },
          });

          // @ts-ignore
          validateHsl(data.newUser?.appearance);
          data.roomStatus?.players.forEach((player) =>
            validateHsl(player.appearance)
          );
        });
      } else {
        return Promise.resolve();
      }
    });

    await Promise.all(promises);

    joinRoomList[2].clientEmitEvent({ roomName: 'room1' });

    promises = roomJoinedList.slice(0, 3).map((roomJoined, index) => {
      if (index <= 1) {
        return roomJoined.promisifyEvent().then((data) => {
          expect(data).toMatchObject({
            newUser: {
              id: sockets[2].id,
              requestStartSimulation: false,
            },
            roomStatus: null,
          });

          // @ts-ignore
          validateHsl(data.newUser?.appearance);
        });
      } else {
        return roomJoined.promisifyEvent().then((data) => {
          expect(data).toMatchObject({
            newUser: {
              id: sockets[2].id,
              requestStartSimulation: false,
            },
            roomStatus: {
              players: [
                {
                  id: sockets[0].id,
                  requestStartSimulation: false,
                },
                {
                  id: sockets[1].id,
                  requestStartSimulation: false,
                },
                {
                  id: sockets[2].id,
                  requestStartSimulation: false,
                },
              ],
              guests: [],
            },
          });

          // @ts-ignore
          validateHsl(data.newUser?.appearance);
          data.roomStatus?.players.forEach((player) =>
            validateHsl(player.appearance)
          );
        });
      }
    });

    await Promise.all(promises);

    setupClientEnvList.slice(0, 3).forEach((setupClientEnv) => {
      expect(setupClientEnv.data).toMatchObject({
        dimension: {
          upperLeft: { x: 0, y: 0 },
          bottomRight: { x: 99, y: 99 },
        },
      });
    });
  });

  it('should receive the event that a user has leaved the room', async () => {
    expect.assertions(13);
    const leavedUserId = sockets[0].id;

    (sockets[0][LeaveRoom.classIdentifier] as LeaveRoom).clientEmitEvent();

    const promises = sockets.slice(0, 3).map(async (socket) => {
      const roomLeaved = socket[RoomLeaved.classIdentifier] as RoomLeaved;
      const roomJoined = socket[RoomJoined.classIdentifier] as RoomJoined;
      const data = await roomLeaved.promisifyEvent();

      expect(data).toMatchObject({
        roomName: 'room1',
        leavedUser: { id: leavedUserId },
      });

      expect(
        roomJoined.data?.roomStatus?.players.some(
          (player) => player.id === leavedUserId
        )
      ).toEqual(false);
      expect(
        roomJoined.data?.roomStatus?.guests.some(
          (guest) => guest.id === leavedUserId
        )
      ).toEqual(false);

      return data;
    });

    await Promise.all(promises);

    (sockets[3][JoinRoom.classIdentifier] as JoinRoom).clientEmitEvent({
      roomName: 'room1',
    });

    const joinPromises = sockets.map(async (socket, index) => {
      const roomJoined = socket[RoomJoined.classIdentifier] as RoomJoined;
      if (index === 0) {
        const promise = roomJoined.promisifyEvent();
        await sleep(1000);
        expect(await isPromisePending(promise)).toBe(true);
        return;
      } else {
        const data = await roomJoined.promisifyEvent();
        if (index === 3) {
          expect(data).toMatchObject({
            newUser: {
              id: socket.id,
              requestStartSimulation: false,
            },
            roomStatus: {
              players: [
                {
                  id: sockets[1].id,
                  requestStartSimulation: false,
                },
                {
                  id: sockets[2].id,
                  requestStartSimulation: false,
                },
                {
                  id: sockets[3].id,
                  requestStartSimulation: false,
                },
              ],
              guests: [],
            },
          });
        } else {
          expect(data).toMatchObject({
            newUser: {
              id: sockets[3].id,
              requestStartSimulation: false,
            },
            roomStatus: null,
          });
        }
        return data;
      }
    });

    await Promise.all(joinPromises);
  });

  it("should notify the room's users that a user has disconnected from the room", async () => {
    const disconnectedUserId = sockets[1].id;
    sockets[1].disconnect();

    const promises = sockets.map(async (socket, index) => {
      const roomLeaved = socket[RoomLeaved.classIdentifier] as RoomLeaved;

      if (index <= 1) {
        return Promise.resolve();
      } else {
        const data = await roomLeaved.promisifyEvent();

        expect(data).toMatchObject({
          roomName: 'room1',
          leavedUser: { id: disconnectedUserId },
        });
      }
    });

    await Promise.all(promises);
  });

  afterAll(() => {
    sockets.forEach((socket) => socket.disconnect());
  });
});
