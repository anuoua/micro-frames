import {
  Frame,
  LocalStore,
  SessionStore,
  CookieStore2,
  Nav,
} from "../protocol";
import { hack } from "./nav";

export const nav = { ...Nav.functions, $on: Nav.on, $broadcast: Nav.broadcast };

export const localStore = {
  ...LocalStore.functions,
};

export const sessionStore = {
  ...SessionStore.functions,
};

export const cookieStore2 = {
  ...CookieStore2.functions,
};

export const frame = {
  $broadcast: Frame.broadcast,
  $on: Frame.on,
};

export function init() {
  hack();
  LocalStore.registFunctions();
  SessionStore.registFunctions();
  Nav.registFunctions();
  CookieStore2.registFunctions();
}
