import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::SessionStore",
});

export const { emit, on, off } = createBroadcasts<{
  storage: {
    key: string | null;
    newValue: string | null;
    oldValue: string | null;
  };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  setItem: (key: string, value: string) => {
    value !== sessionStorage.getItem(key) &&
      emit("storage", {
        key: key,
        newValue: value,
        oldValue: sessionStorage.getItem(key),
      });
    return sessionStorage.setItem(key, value);
  },

  getItem: (key: string) => {
    return sessionStorage.getItem(key);
  },

  removeItem: (key: string) => {
    emit("storage", {
      key: key,
      newValue: null,
      oldValue: sessionStorage.getItem(key),
    });
    return sessionStorage.removeItem(key);
  },

  clear: () => {
    emit("storage", {
      key: null,
      newValue: null,
      oldValue: null,
    });
    return sessionStorage.clear();
  },

  key: (index: number) => {
    return sessionStorage.key(index);
  },

  length: () => {
    return sessionStorage.length;
  },
});
