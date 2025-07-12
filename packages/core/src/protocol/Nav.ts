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
  back: { key: string };
  forward: { key: string };
  go: { delta: number; key: string };
  popstate: { state: any };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  getHistoryProState: () => {
    return {};
  },
});
