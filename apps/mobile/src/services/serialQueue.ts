export interface SerialQueue {
  run<T>(operation: () => Promise<T>): Promise<T>;
}

export const createSerialQueue = (): SerialQueue => {
  let tail: Promise<void> = Promise.resolve();
  return {
    run<T>(operation: () => Promise<T>): Promise<T> {
      const task = tail.then(operation);
      tail = task.then(
        () => undefined,
        () => undefined,
      );
      return task;
    },
  };
};
