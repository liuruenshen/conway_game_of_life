import { io } from 'socket.io-client';
import { TESTING_WS_PORT } from '../constant';
import { IOClientSocket } from '../interface';
import { pEvent, PEventRejectError } from '../../utilities/pEvent';
import { CreateRoom } from '../events/CreateRoom';
import { RoomJoined } from '../events/RoomJoined';
import { JoinRoom } from '../events/JoinRoom';
import { sleep } from '../../utilities/sleep';
import { isPromisePending } from '../../utilities/isPromisePending';

describe('Test room handler', () => {
  const sockets: IOClientSocket[] = [];

  beforeAll(async () => {
    const socket1 = io(`http://localhost:${TESTING_WS_PORT}`);
    await pEvent(socket1, 'connect');
    const socket2 = io(`http://localhost:${TESTING_WS_PORT}`);
    await pEvent(socket2, 'connect');

    sockets.push(socket1);
    sockets.push(socket2);
  });

  it('should send create-room event successfully', async () => {
    expect.assertions(2);

    const createRoom = new CreateRoom({
      clientSocket: sockets[0],
    });

    createRoom.clientEmitEvent({ roomName: 'room1' });

    const roomJoined1 = new RoomJoined({ clientSocket: sockets[0] });
    const roomJoined2 = new RoomJoined({ clientSocket: sockets[1] });

    const neverFulFilledPromise = roomJoined2.promisifyEvent();

    expect(await roomJoined1.promisifyEvent()).toMatchObject({
      roomName: 'room1',
      id: roomJoined1.clientSocket?.id,
    });

    await sleep(1000);
    expect(await isPromisePending(neverFulFilledPromise)).toBe(true);
  });

  it('should receive invalid-payload event', async () => {
    expect.assertions(3);

    const createRoom = new CreateRoom({
      clientSocket: sockets[1],
    });

    const roomJoined1 = new RoomJoined({ clientSocket: sockets[1] });
    const roomJoined2 = new RoomJoined({ clientSocket: sockets[0] });

    // @ts-ignore
    createRoom.clientEmitEvent({ hello: '12344' });

    const neverFulFilledPromise = roomJoined2.promisifyEvent();

    try {
      await roomJoined1.promisifyEvent();
    } catch (e) {
      expect(e).toBeInstanceOf(PEventRejectError);
      expect((e as PEventRejectError).payload).toMatchObject({
        eventName: 'create-room',
      });
    }

    await sleep(1000);
    expect(await isPromisePending(neverFulFilledPromise)).toBe(true);
  });

  it('should join the existing room successfully', async () => {
    expect.assertions(2);

    const joinRoom = new JoinRoom({ clientSocket: sockets[1] });
    const roomJoined1 = new RoomJoined({ clientSocket: sockets[1] });
    const roomJoined2 = new RoomJoined({ clientSocket: sockets[0] });

    joinRoom.clientEmitEvent({ roomName: 'room1' });

    const promise1 = roomJoined1.promisifyEvent();
    const promise2 = roomJoined2.promisifyEvent();

    expect(await promise1).toMatchObject({
      roomName: 'room1',
      id: roomJoined1.clientSocket?.id,
    });
    expect(await promise2).toMatchObject({
      roomName: 'room1',
      id: roomJoined1.clientSocket?.id,
    });
  });

  afterAll(() => {
    sockets.forEach((socket) => socket.disconnect());
  });
});
