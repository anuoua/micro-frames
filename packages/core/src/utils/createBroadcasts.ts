import Framebus from "framebus";

export const createBroadcasts = <T extends Record<string, any>>(
  framebus: Framebus
) => {
  type NeverRecords = {
    [K in keyof T as T[K] extends never ? K : never]: T[K];
  };

  type HasRecords = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
  };

  type BroadCasts = {
    (event: keyof HasRecords, data: HasRecords[keyof HasRecords]): void;
    (event: keyof NeverRecords): void;
  };

  const emit: BroadCasts = (
    event: keyof T,
    data?: HasRecords[keyof HasRecords]
  ) => {
    framebus.emit(event as string, data);
  };

  type Callback<E> = E extends keyof HasRecords
    ? (data: HasRecords[E]) => void
    : () => void;

  const on = <E extends keyof T>(event: E, callback: Callback<E>) => {
    framebus.on(event as string, callback as () => void);
  };

  const off = <E extends keyof T>(event: E, callback: Callback<E>) => {
    framebus.off(event as string, callback as () => void);
  };

  return {
    emit,
    on,
    off,
  };
};
