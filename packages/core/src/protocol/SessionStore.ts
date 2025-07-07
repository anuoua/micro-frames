import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::SessionStore",
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
      oldValue: sessionStorage.getItem(key),
    });
    return sessionStorage.setItem(key, value);
  },

  getItem: (key: string) => {
    return sessionStorage.getItem(key);
  },

  removeItem: (key: string) => {
    return sessionStorage.removeItem(key);
  },

  clear: () => {
    return sessionStorage.clear();
  },

  key: (index: number) => {
    return sessionStorage.key(index);
  },

  length: () => {
    return sessionStorage.length;
  },
});
