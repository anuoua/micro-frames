import Framebus from "framebus";
import { createFunctions } from "../utils/createFunctions";
import { createBroadcasts } from "../utils/createBroadcasts";

export interface Cookie {
  domain: string;
  expires: number;
  name: string;
  partitioned: boolean;
  path: string;
  sameSite: "strict" | "lax" | "none";
  secure: boolean;
  value: string;
}

export interface CookieChangedEvent extends Event {
  changed: Readonly<Array<Cookie>>;
  deleted: Readonly<Array<Cookie>>;
}

export interface CookieStore {
  get(name: string): Promise<Cookie | null>;
  get(options: { name: string; url?: string }): Promise<Cookie | null>;

  getAll(): Promise<Cookie[]>;
  getAll(name: string): Promise<Cookie[]>;
  getAll(options: { name?: string; url?: string }): Promise<Cookie[]>;

  set(name: string, value: string): Promise<void>;
  set(
    options: Partial<Cookie> & { name: string; value: string }
  ): Promise<void>;

  delete(name: string): Promise<void>;
  delete(options: { name: string; url?: string }): Promise<void>;

  addEventListener(
    eventName: "change",
    handler: (event: CookieChangedEvent) => void
  ): void;
  removeEventListener(
    eventName: "change",
    handler: (event: CookieChangedEvent) => void
  ): void;
  onchange: null | ((event: CookieChangedEvent) => void);
}

declare var cookieStore: CookieStore;

const framebus = new Framebus({
  channel: "MCF::CookieStore",
});

export const { emit, on, off } = createBroadcasts<{
  change: {
    changed: Readonly<Array<Cookie>>;
    deleted: Readonly<Array<Cookie>>;
  };
}>(framebus);

const fns = createFunctions(framebus, {
  set: (options: {
    name: string;
    value: string;
    domain?: string;
    expires?: number;
    path?: string;
    partitioned?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }) => {
    return cookieStore.set(options);
  },

  get: (key: string) => {
    return cookieStore.get(key);
  },

  getAll: (key: string) => {
    return cookieStore.getAll(key);
  },

  delete: (key: string) => {
    return cookieStore.delete(key);
  },
});

export const registFunctions = () => {
  // @ts-expect-error
  window.cookieStore &&
    // @ts-expect-error
    window.cookieStore.addEventListener("change", (e) => {
      emit("change", {
        changed: e.changed,
        deleted: e.deleted,
      });
    });

  fns.registFunctions();
};

export const functions = fns.functions;

export const CookieStore2 = {
  $emit: emit,
  $on: on,
  $off: off,
  registFunctions,
  ...functions,
};
