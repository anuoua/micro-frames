import Framebus from "framebus";
import { createBroadcasts } from "../utils/createBroadcasts";
import { createFunctions } from "../utils/createFunctions";
import { HistoryPro } from "../history-pro";

const framebus = new Framebus({
  channel: "MCF::Nav",
});

export interface HistoryOptions {
  state: any;
  title: string;
  url?: string | null;
}

export const { emit, on, off } = createBroadcasts<{
  pushState: HistoryOptions;
  replaceState: HistoryOptions;
  back: { key: string };
  forward: { key: string };
  go: { delta: number; key: string };
  popstate: { state: any };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  mainPushState: (state: any, title: string, url: string) => {
    history.pushState(state, title, url);
  },
  mainOpen: (url?: string | URL, target?: string, features?: string) => {
    window.open(url, target, features);
  },
  mainHref: (href: string) => {
    window.location.href = href;
  },
  mainGetHistoryProState: () => {
    return {
      historyStack: ((window as any).historyPro as HistoryPro).historyStack,
      currentHistoryIndex: ((window as any).historyPro as HistoryPro)
        .currentHistoryIndex,
    };
  },
});

export const Nav = {
  $emit: emit,
  $on: on,
  $off: off,
  registFunctions,
  ...functions,
};
