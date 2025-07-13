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

export const frame = {
  ...Frame.functions,
  $on: Frame.on,
};

export const nav = {
  ...Nav.functions,
};

export function init(options: InitOptions) {
  webComponentFrames();

  hack(options);

  customElements.define("mcf-moduleframe", ModuleFrame);
}
