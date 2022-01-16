interface EventEmitter {
  on: (eventName: string, ...args: any[]) => void;
  off: (eventName: string, handler: (...args: unknown[]) => void) => void;
}

interface PEventOptions {
  rejectEvents?: string[];
}

export class PEventRejectError extends Error {
  #eventName: string;
  #payload: any;
  constructor(eventName: string, message: string, args: any) {
    super(message);
    this.#eventName = eventName;
    this.#payload = args;
  }

  public get eventName() {
    return this.#eventName;
  }

  public get payload() {
    return this.#payload;
  }
}

export function pEvent<T>(
  instance: EventEmitter,
  event: string | Promise<T>,
  options: PEventOptions = {}
) {
  return new Promise<T>((resolve, reject) => {
    let detatchEventFuncList: (() => void)[] = [];
    const resolveEventHandler = (args: T) => {
      detatchEventFuncList.forEach((func) => func());
      resolve(args);
    };

    if (options.rejectEvents) {
      detatchEventFuncList = detatchEventFuncList.concat(
        options.rejectEvents.map((rejectingEventName) => {
          const rejectEventHandler = (args: any) => {
            detatchEventFuncList.forEach((func) => func());

            reject(
              new PEventRejectError(
                rejectingEventName,
                event instanceof Promise
                  ? `Fail to resolve because of rejectingEvent ${rejectingEventName}`
                  : `expect receiving ${event}, but ${rejectingEventName}`,
                args
              )
            );
          };

          instance.on(rejectingEventName, rejectEventHandler);

          return () => {
            // @ts-ignore
            instance.off(rejectingEventName, rejectEventHandler);
          };
        })
      );
    }

    if (event instanceof Promise) {
      event.then(resolveEventHandler);
    } else {
      detatchEventFuncList.push(() => {
        //@ts-ignore
        instance.off(event, resolveEventHandler);
      });

      instance.on(event, resolveEventHandler);
    }
  });
}
