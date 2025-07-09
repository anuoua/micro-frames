import {
  LocalStore,
  SessionStore,
  CookieStore2,
  Nav,
  MemoryStore,
} from "../protocol";
import { hack } from "./nav";

export const nav = { ...Nav.functions, $on: Nav.on };

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

export function init() {
  hack();
  LocalStore.registFunctions();
  SessionStore.registFunctions();
  Nav.registFunctions();
  CookieStore2.registFunctions();
  MemoryStore.registFunctions();
}
