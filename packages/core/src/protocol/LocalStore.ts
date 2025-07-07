import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::LocalStore",
});

export const { broadcast, on } = createBroadcasts<{
  storage: {
    key: string;
    newValue: string | null;
    oldValue: string | null;
  };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  setItem: (key: string, value: string) => {
    broadcast("storage", {
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
    return localStorage.removeItem(key);
  },

  clear: () => {
    return localStorage.clear();
  },

  key: (index: number) => {
    return localStorage.key(index);
  },

  length: () => {
    return localStorage.length;
  },
});
