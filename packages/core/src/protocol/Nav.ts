import Framebus from "framebus";
import { createBroadcasts } from "../utils/createBroadcasts";
import { createFunctions } from "../utils/createFunctions";

const framebus = new Framebus({
  channel: "MCF::Nav",
});

export interface HistoryOptions {
  state: any;
  title: string;
  url?: string | null;
}

export const { emit, on } = createBroadcasts<{
  pushState: HistoryOptions;
  replaceState: HistoryOptions;
  popstate: { state: any };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  pushState: (state: any, title: string, url?: string | null) => {
    history.pushState(state, title, url);
  },
  replaceState: (state: any, title: string, url?: string | null) => {
    history.replaceState(state, title, url);
  },
  back: () => {
    history.back();
  },
  forward: () => {
    history.forward();
  },
  go: (delta?: number) => {
    history.go(delta);
  },
});
