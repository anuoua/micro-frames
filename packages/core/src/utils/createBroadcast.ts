import Framebus from "framebus";

export const createBroadCast = <
  T extends Record<string, any> | undefined = undefined
>(
  framebus: Framebus,
  event: string
) => {
  type OptionArgFn = undefined extends T ? () => void : (data: T) => void;

  const emit: OptionArgFn = (data?: T) => {
    framebus.emit(event, data);
  };

  const on = (callback: OptionArgFn) => {
    framebus.on(event, (data) => callback(data as T));
  };

  return {
    emit,
    on,
  };
};
