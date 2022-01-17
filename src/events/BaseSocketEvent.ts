import * as Type from '../interface';

export interface BaseSocketEventProps<E extends string> {
  server?: Type.IOServer | null;
  serverSocket?: Type.IOSocket | null;
  clientSocket?: Type.IOClientSocket | null;
  eventName: E;
}

const CLASS_IDENTIFIER = Symbol('BaseSocketEvent');

type GeneralBaseSocketEvent = BaseSocketEvent<string, any>;

export abstract class BaseSocketEvent<E extends string, T> {
  #server: Type.IOServer | null;
  #serverSocket: Type.IOSocket | null;
  #clientSocket: Type.IOClientSocket | null;
  #eventName: E;
  #data: T | null = null;

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
    this.clientEventHandler = this.clientEventHandler.bind(this);

    const instanceList: GeneralBaseSocketEvent[] =
      (this.socket[CLASS_IDENTIFIER] as GeneralBaseSocketEvent[]) || [];

    const duplicated = instanceList.some(
      (instance) => instance.getClassIdentifer() === this.getClassIdentifer()
    );

    if (duplicated) {
      return;
    }

    this.socket[CLASS_IDENTIFIER] = instanceList;

    if (!instanceList.length && this.socket === this.#clientSocket) {
      this.#clientSocket.on('connect', () => {
        instanceList.forEach((instance) => instance.clientAttatchEvent());
      });
    }

    instanceList.push(this);
    this.bindInstanceToSocket(this.getClassIdentifer());

    if (this.#clientSocket) {
      if (this.#clientSocket.connected) {
        this.clientAttatchEvent();
      }
    }

    if (this.#serverSocket) {
      this.severAttatchEvent();
    }
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

    this.serverSocket.off(this.eventName, this.serverEventHandler);
    this.serverSocket.on(this.eventName, this.serverEventHandler as any);
  }

  public clientAttatchEvent() {
    if (!this.clientSocket) {
      return;
    }

    this.clientSocket.off(this.eventName, this.clientEventHandler as any);
    this.clientSocket.on(this.eventName, this.clientEventHandler as any);
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

  public set data(data: T | null) {
    this.#data = data;
  }

  public get data(): T | null {
    return this.#data;
  }

  protected bindInstanceToSocket(classIdentifier: symbol) {
    if (this.clientSocket) {
      this.clientSocket[classIdentifier] = this;
    }

    if (this.serverSocket) {
      this.serverSocket[classIdentifier] = this;
    }
  }

  protected getOrSetAttatchedEventSocket<
    E extends BaseSocketEvent<string, any>
  >(
    classEvent: {
      new (props: Omit<BaseSocketEventProps<string>, 'eventName'>): E;
      classIdentifier: symbol;
    },
    props: Omit<BaseSocketEventProps<string>, 'eventName'>
  ): E {
    const socket = this.socket;
    if (!socket[classEvent.classIdentifier]) {
      return new classEvent(props);
    }

    return socket[classEvent.classIdentifier] as E;
  }

  abstract serverEmitEvent(payload: T): void;

  abstract clientEmitEvent(payload: T): void;

  abstract serverEventHandler(payload: T): void;

  abstract clientEventHandler(payload: T): void;

  abstract promisifyEvent(): Promise<T>;

  abstract getClassIdentifer(): symbol;

  static get classIdentifier(): symbol {
    return CLASS_IDENTIFIER;
  }
}
