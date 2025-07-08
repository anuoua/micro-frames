import { HistoryPro } from "../history-pro";
import {
  Frame,
  LocalStore,
  SessionStore,
  CookieStore2,
  MemoryStore,
} from "../protocol";
import { getFullPath } from "../utils/getFullPath";
import { CURRENT_KEY, hack, InitOptions, STACK_KEYS } from "./nav";

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
  $broadcast: Frame.broadcast,
  $on: Frame.on,
};

export const createUrl = (baseURL: string) => {
  const url = getFullPath();
  const path = url
    ? url.match(new RegExp(`${baseURL}\\b`))
      ? url.replace(baseURL, "")
      : `/404/${history.state[HistoryPro.STATE_KEY]}`
    : url;
  return `${path}?${CURRENT_KEY}=${
    history.state[HistoryPro.STATE_KEY]
  }&${STACK_KEYS}=${(history as HistoryPro).historyStack.map((i) =>
    HistoryPro.getKey(i.state)
  )}`;
};

export function init(options: InitOptions) {
  hack(options);
}
