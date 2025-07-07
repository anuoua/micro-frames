import Framebus from "framebus";
import { createBroadcasts } from "../utils/createBroadcasts";

const framebus = new Framebus({
  channel: "MCF::Frame",
});

export const { broadcast, on } = createBroadcasts<{
  mainActive: never;
  moduleActive: {
    module: string;
  };
}>(framebus);
