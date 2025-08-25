import Framebus from "framebus";
import { createBroadcasts } from "../utils/createBroadcasts";
import { createFunctions } from "../utils/createFunctions";
import { initOptions } from "../module-frame";

export const framebus = new Framebus({
  channel: "MCF::Frame",
});

export const { emit, on, off } = createBroadcasts<{
  "active-main": { active: boolean };
  "module-inited": initOptions;
  "module-active": string;
  "module-inactive": string;
  "update-frame": {
    headerHeight: number;
    sidebarWidth: number;
    layout: "vertical" | "horizontal";
  };
}>(framebus);

export const { registFunctions, functions } = createFunctions(framebus, {
  getActiveIframe() {
    const activeIframe = document.querySelector('mcf-iframe[active]');
    return activeIframe?.getAttribute("src");
  },
  getMainFrameConfigs: () => {
    const frameworkElement = document.querySelector("mcf-mainframe");
    const headerHeight = frameworkElement?.getAttribute("header-height") ?? "0";
    const sidebarWidth = frameworkElement?.getAttribute("sidebar-width") ?? "0";
    return {
      headerHeight: parseInt(headerHeight, 10),
      sidebarWidth: parseInt(sidebarWidth, 10),
    };
  },
});

export const Frame = {
  $emit: emit,
  $on: on,
  $off: off,
  registFunctions,
  ...functions,
};
