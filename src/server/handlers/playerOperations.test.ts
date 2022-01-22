import { io } from 'socket.io-client';
import { TESTING_WS_PORT } from '../constant';
import {
  IOClientSocket,
  RoomJoinedPayload,
  Player,
  LivingCellsUpdatedPayload,
} from '../../interface';
import { pEvent } from '../../utilities/pEvent';
import { AddLivingCells } from '../../events/AddLivingCells';
import { RemoveLivingCells } from '../../events/RemoveLivingCells';
import { RequestSimulation } from '../../events/RequestSimulation';
import { RequestSimulationUpdated } from '../../events/RequestSimulationUpdated';
import { CreateRoom } from '../../events/CreateRoom';
import { LivingCellsUpdated } from '../../events/LivingCellsUpdated';
import { JoinRoom } from '../../events/JoinRoom';
import { RoomJoined } from '../../events/RoomJoined';
import { sleep } from '../../utilities/sleep';
import { isPromisePending } from '../../utilities/isPromisePending';

describe('Test player operations', () => {
  const sockets: IOClientSocket[] = [];

  beforeAll(async () => {
    const socket1 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;
    const socket2 = io(`http://localhost:${TESTING_WS_PORT}`) as IOClientSocket;

    await Promise.all([pEvent(socket1, 'connect'), pEvent(socket2, 'connect')]);

    sockets.push(socket1);
    sockets.push(socket2);
  });

  it('should add and receive living cells', async () => {
    expect.assertions(6);

    sockets.forEach((socket) => {
      new CreateRoom({ clientSocket: socket });
      new JoinRoom({ clientSocket: socket });
      new RoomJoined({ clientSocket: socket });
      new AddLivingCells({ clientSocket: socket });
      new RemoveLivingCells({ clientSocket: socket });
      new RequestSimulation({ clientSocket: socket });
      new LivingCellsUpdated({ clientSocket: socket });
      new RequestSimulationUpdated({ clientSocket: socket });
    });

    (sockets[0][CreateRoom.classIdentifier] as CreateRoom).clientEmitEvent({
      roomName: 'room2',
    });

    const roomJoinedData: RoomJoinedPayload[] = [];

    roomJoinedData.push(
      await (
        sockets[0][RoomJoined.classIdentifier] as RoomJoined
      ).promisifyEvent()
    );

    (sockets[1][JoinRoom.classIdentifier] as JoinRoom).clientEmitEvent({
      roomName: 'room2',
    });

    roomJoinedData.push(
      await (
        sockets[1][RoomJoined.classIdentifier] as RoomJoined
      ).promisifyEvent()
    );

    (
      sockets[0][AddLivingCells.classIdentifier] as AddLivingCells
    ).clientEmitEvent([
      { x: 10, y: 10 },
      { x: 11, y: 11 },
      { x: 12, y: 12 },
      { x: 13, y: 13 },
      { x: 14, y: 14 },
    ]);

    (
      sockets[1][AddLivingCells.classIdentifier] as AddLivingCells
    ).clientEmitEvent([
      { x: 14, y: 10 },
      { x: 13, y: 11 },
      { x: 11, y: 13 },
      { x: 10, y: 14 },
    ]);

    const LivingCellsUpdatedList = sockets.map(
      (socket) =>
        socket[LivingCellsUpdated.classIdentifier] as LivingCellsUpdated
    );

    await Promise.all(
      LivingCellsUpdatedList.map(async (instance, index) => {
        const dataList: LivingCellsUpdatedPayload[] = [];

        dataList.push(await instance.promisifyEvent());
        dataList.push(await instance.promisifyEvent());

        const appearances = roomJoinedData.map(
          (item) => (item.newUser as Player).appearance
        );

        expect(dataList[0]).toMatchObject({
          roomName: 'room2',
          cells: [],
        });

        expect(dataList[1]).toMatchObject({
          roomName: 'room2',
          cells: [
            {
              position: { x: 10, y: 10 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 11, y: 11 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 12, y: 12 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 13, y: 13 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 14, y: 14 },
              isLiving: true,
              appearance: appearances[0],
            },
          ],
        });
      })
    );

    await Promise.all(
      LivingCellsUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();
        const appearances = roomJoinedData.map(
          (item) => (item.newUser as Player).appearance
        );

        expect(data).toMatchObject({
          roomName: 'room2',
          cells: [
            {
              position: { x: 10, y: 10 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 11, y: 11 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 12, y: 12 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 13, y: 13 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 14, y: 14 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 14, y: 10 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 13, y: 11 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 11, y: 13 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 10, y: 14 },
              isLiving: true,
              appearance: appearances[1],
            },
          ],
        });
      })
    );
  });

  it('should remove and receiving current living cells', async () => {
    expect.assertions(4);

    (
      sockets[0][RemoveLivingCells.classIdentifier] as RemoveLivingCells
    ).clientEmitEvent([
      { x: 10, y: 10 },
      { x: 14, y: 14 },
    ]);

    (
      sockets[1][RemoveLivingCells.classIdentifier] as RemoveLivingCells
    ).clientEmitEvent([
      { x: 14, y: 10 },
      { x: 10, y: 14 },
    ]);

    const LivingCellsUpdatedList = sockets.map(
      (socket) =>
        socket[LivingCellsUpdated.classIdentifier] as LivingCellsUpdated
    );

    const roomJoinedData = sockets.map(
      (socket) => (socket[RoomJoined.classIdentifier] as RoomJoined).data
    );

    await Promise.all(
      LivingCellsUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();
        const appearances = roomJoinedData.map(
          (item) => (item?.newUser as Player)?.appearance
        );

        expect(data).toMatchObject({
          roomName: 'room2',
          cells: [
            {
              position: { x: 11, y: 11 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 12, y: 12 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 13, y: 13 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 14, y: 10 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 13, y: 11 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 11, y: 13 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 10, y: 14 },
              isLiving: true,
              appearance: appearances[1],
            },
          ],
        });
      })
    );

    await Promise.all(
      LivingCellsUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();
        const appearances = roomJoinedData.map(
          (item) => (item?.newUser as Player)?.appearance
        );

        expect(data).toMatchObject({
          roomName: 'room2',
          cells: [
            {
              position: { x: 11, y: 11 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 12, y: 12 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 13, y: 13 },
              isLiving: true,
              appearance: appearances[0],
            },
            {
              position: { x: 13, y: 11 },
              isLiving: true,
              appearance: appearances[1],
            },
            {
              position: { x: 11, y: 13 },
              isLiving: true,
              appearance: appearances[1],
            },
          ],
        });
      })
    );
  });

  it('should receive the simulation request', async () => {
    expect.assertions(4);

    (
      sockets[0][RequestSimulation.classIdentifier] as RequestSimulation
    ).clientEmitEvent(true);

    (
      sockets[1][RequestSimulation.classIdentifier] as RequestSimulation
    ).clientEmitEvent(true);

    const RequestSimulationUpdatedList = sockets.map(
      (socket) =>
        socket[
          RequestSimulationUpdated.classIdentifier
        ] as RequestSimulationUpdated
    );

    await Promise.all(
      RequestSimulationUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();

        expect(data).toMatchObject({
          roomName: 'room2',
          playerId: sockets[0].id,
          requestSimulation: true,
        });
      })
    );

    await Promise.all(
      RequestSimulationUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();

        expect(data).toMatchObject({
          roomName: 'room2',
          playerId: sockets[1].id,
          requestSimulation: true,
        });
      })
    );
  });

  it('should receive living-cell-updated event', async () => {
    expect.assertions(10);

    const LivingCellsUpdatedList = sockets.map(
      (socket) =>
        socket[LivingCellsUpdated.classIdentifier] as LivingCellsUpdated
    );

    const promisesList = [];
    for (let i = 0; i < 5; ++i) {
      promisesList.push(
        await Promise.all(
          LivingCellsUpdatedList.map(async (instance) => {
            const data = await instance.promisifyEvent();

            expect(data).toMatchObject({
              roomName: 'room2',
              cells: [
                {
                  position: { x: 11, y: 12 },
                  isLiving: true,
                },
                {
                  position: { x: 12, y: 11 },
                  isLiving: true,
                },
                {
                  position: { x: 12, y: 13 },
                  isLiving: true,
                },
                {
                  position: { x: 13, y: 12 },
                  isLiving: true,
                },
              ],
              simulationFrame: i + 1,
            });
          })
        )
      );
    }

    await Promise.all(promisesList);
  });

  it('should stop receving living-cell-updated event', async () => {
    expect.assertions(4);

    (
      sockets[1][RequestSimulation.classIdentifier] as RequestSimulation
    ).clientEmitEvent(false);

    const RequestSimulationUpdatedList = sockets.map(
      (socket) =>
        socket[
          RequestSimulationUpdated.classIdentifier
        ] as RequestSimulationUpdated
    );

    await Promise.all(
      RequestSimulationUpdatedList.map(async (instance) => {
        const data = await instance.promisifyEvent();

        expect(data).toMatchObject({
          roomName: 'room2',
          playerId: sockets[1].id,
          requestSimulation: false,
        });
      })
    );

    const LivingCellsUpdatedList = sockets.map(
      (socket) =>
        socket[LivingCellsUpdated.classIdentifier] as LivingCellsUpdated
    );

    for (let i = 0; i < LivingCellsUpdatedList[0].bufferLength; ++i) {
      await LivingCellsUpdatedList[0].promisifyEvent();
    }

    for (let i = 0; i < LivingCellsUpdatedList[1].bufferLength; ++i) {
      await LivingCellsUpdatedList[1].promisifyEvent();
    }

    await Promise.all(
      LivingCellsUpdatedList.map(async (instance) => {
        const promise = instance.promisifyEvent();
        await sleep(1000);

        expect(await isPromisePending(promise)).toBe(true);
      })
    );
  });

  afterAll(() => {
    sockets.forEach((socket) => socket.disconnect());
  });
});
