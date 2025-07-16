import { HistoryPro } from "../history-pro";
import { getFullPath } from "./getFullPath";

export const createUrl = (origin: string, baseURL: string) => {
  origin = origin.replace(/(\/)?$/, "");

  const url = getFullPath();

  const path = url
    ? url.match(new RegExp(`${baseURL}\\b`))
      ? url.replace(baseURL, "")
      : `/404/${history.state[HistoryPro.STATE_KEY]}`
    : url;

  return `${origin}${path}`;
};
