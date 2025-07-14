import {
  LocalStore,
  SessionStore,
  CookieStore2,
  Nav,
  MemoryStore,
  Frame,
} from "../protocol";
import { webComponentFrames } from "../utils/webComponentFrames";
import { IFrame } from "./IFrame";
import { MainFrame } from "./MainFrame";
import { hack } from "./nav";

export const nav = { ...Nav.functions, $on: Nav.on, $off: Nav.off };

export const localStore = {
  ...LocalStore.functions,
  $on: LocalStore.on,
  $off: LocalStore.off,
};

export const sessionStore = {
  ...SessionStore.functions,
  $on: SessionStore.on,
  $off: SessionStore.off,
};

export const cookieStore2 = {
  ...CookieStore2.functions,
  $on: CookieStore2.on,
  $off: CookieStore2.off,
};

export const memoryStore = {
  ...MemoryStore.functions,
  $on: MemoryStore.on,
  $off: MemoryStore.off,
};

export const frame = {
  $on: Frame.on,
  $off: Frame.off,
};

export function init() {
  webComponentFrames();

  hack();

  LocalStore.registFunctions();
  SessionStore.registFunctions();
  Nav.registFunctions();
  CookieStore2.registFunctions();
  MemoryStore.registFunctions();
  Frame.registFunctions();

  customElements.define("mcf-mainframe", MainFrame);
  customElements.define("mcf-iframe", IFrame);
}
