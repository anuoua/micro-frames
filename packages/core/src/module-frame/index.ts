import {
  LocalStore,
  SessionStore,
  CookieStore2,
  MemoryStore,
  Frame,
  Nav,
} from "../protocol";
import { webComponentFrames } from "../utils/webComponentFrames";
import { ModuleFrame } from "./ModuleFrame";
import { hack, InitOptions } from "./nav";

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
  ...Frame.functions,
  $on: Frame.on,
  $off: Frame.off,
};

export const nav = {
  ...Nav.functions,
  $on: Frame.on,
  $off: Frame.off,
};

export function init(options: InitOptions) {
  webComponentFrames();

  hack(options);

  customElements.define("mcf-moduleframe", ModuleFrame);
}
