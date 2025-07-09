import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::MemoryStore",
});

const store: Record<string, string> = {};

export const { emit, on } = createBroadcasts<{
  storage: {
    key: string | null;
    newValue: string | null;
    oldValue: string | null;
  };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  getAll: () => {
    return { ...store }; // Return a shallow copy of the store
  },

  setItem: (key: string, value: string) => {
    const oldValue = store[key] || null;
    store[key] = value;
    value !== oldValue &&
      emit("storage", {
        key: key,
        newValue: value,
        oldValue: oldValue,
      });
    return value; // Return the new value
  },

  getItem: (key: string) => {
    return store[key] || null; // Return null if the key does not exist
  },

  removeItem: (key: string) => {
    const oldValue = store[key] || null;
    delete store[key];
    emit("storage", {
      key: key,
      newValue: null,
      oldValue: oldValue,
    });
    return oldValue; // Return the removed value
  },

  clear: () => {
    for (const key in store) {
      delete store[key];
    }
    emit("storage", {
      key: null,
      newValue: null,
      oldValue: null,
    });
    return; // Clear does not return a value
  },

  key: (index: number) => {
    const keys = Object.keys(store);
    return keys[index] || null; // Return null if the index is out of bounds
  },

  length: () => {
    return Object.keys(store).length; // Return the number of items in the store
  },
});
