interface FlattenPromise<T> {
  promise: Promise<T>;
  resolve: (arg: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function getFlattenPromise<T>() {
  let localResolve: FlattenPromise<T>['resolve'] | null = null;
  let localReject: FlattenPromise<T>['reject'] | null = null;
  const promise = new Promise<T>((resolve, reject) => {
    localResolve = resolve;
    localReject = reject;
  });

  return {
    promise,
    resolve: localResolve,
    reject: localReject,
  } as unknown as FlattenPromise<T>;
}
