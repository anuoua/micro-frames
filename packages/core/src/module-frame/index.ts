import {
  LocalStore,
  SessionStore,
  CookieStore2,
  MemoryStore,
} from "../protocol";
import { hack, InitOptions } from "./nav";

export const localStore = {
  ...LocalStore.functions,
  $on: LocalStore.on,
};

export const sessionStore = {
  ...SessionStore.functions,
  $on: SessionStore.on,
};

export const cookieStore2 = {
  ...CookieStore2.functions,
  $on: CookieStore2.on,
};

export const memoryStore = {
  ...MemoryStore.functions,
  $on: MemoryStore.on,
};

export function init(options: InitOptions) {
  hack(options);
}
