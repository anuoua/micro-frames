import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::LocalStore",
});

export const { emit, on } = createBroadcasts<{
  storage: {
    key: string | null;
    newValue: string | null;
    oldValue: string | null;
  };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  setItem: (key: string, value: string) => {
    value !== localStorage.getItem(key) &&
      emit("storage", {
        key: key,
        newValue: value,
        oldValue: localStorage.getItem(key),
      });
    return localStorage.setItem(key, value);
  },

  getItem: (key: string) => {
    return localStorage.getItem(key);
  },

  removeItem: (key: string) => {
    emit("storage", {
      key: key,
      newValue: null,
      oldValue: localStorage.getItem(key),
    });
    return localStorage.removeItem(key);
  },

  clear: () => {
    emit("storage", {
      key: null,
      newValue: null,
      oldValue: null,
    });
    return localStorage.clear();
  },

  key: (index: number) => {
    return localStorage.key(index);
  },

  length: () => {
    return localStorage.length;
  },
});
