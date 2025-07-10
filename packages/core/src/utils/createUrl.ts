import { HistoryPro } from "../history-pro";
import { getFullPath } from "./getFullPath";

export const CURRENT_KEY = "hPKey";

export const STACK_KEYS = "hPSKeys";

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
