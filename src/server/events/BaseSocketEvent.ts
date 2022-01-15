import * as Type from '../interface';

export interface BaseSocketEventProps<E extends string> {
  server?: Type.IOServer | null;
  serverSocket?: Type.IOSocket | null;
  clientSocket?: Type.IOClientSocket | null;
  eventName: E;
}

export abstract class BaseSocketEvent<E extends string, T> {
  #server: Type.IOServer | null;
  #serverSocket: Type.IOSocket | null;
  #clientSocket: Type.IOClientSocket | null;
  #eventName: E;
  constructor({
    server = null,
    serverSocket = null,
    clientSocket = null,
    eventName,
  }: BaseSocketEventProps<E>) {
    this.#server = server;
    this.#serverSocket = serverSocket;
    this.#clientSocket = clientSocket;
    this.#eventName = eventName;
    this.serverEventHandler = this.serverEventHandler.bind(this);
  }

  public get eventName() {
    return this.#eventName;
  }

  public get clientSocket() {
    return this.#clientSocket;
  }

  public get serverSocket() {
    return this.#serverSocket;
  }

  public get server() {
    return this.#server;
  }

  public severAttatchEvent() {
    if (!this.serverSocket) {
      return;
    }

    this.serverSocket.on(this.eventName, this.serverEventHandler as any);
  }

  public get socket() {
    const socket = this.clientSocket || this.serverSocket;

    if (!socket) {
      throw new Error('Socket is undefined');
    }

    return socket;
  }

  public rejectUnimplementedPromisify() {
    return Promise.reject(new Error('Not implemented promisify function'));
  }

  abstract serverEmitEvent(payload: T): void;

  abstract clientEmitEvent(payload: T): void;

  abstract serverEventHandler(payload: T): void;

  abstract clientEventHandler(payload: T): void;

  abstract promisifyEvent(): Promise<T>;
}
