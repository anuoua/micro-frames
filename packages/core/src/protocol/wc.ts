import Framebus from "framebus";
import { createBroadcasts } from "../utils/createBroadcasts";
import { createFunctions } from "../utils/createFunctions";

export const bus = new Framebus({
  channel: "MCF::WC",
});

export const broadcasts = createBroadcasts<{
  "active-main": { active: boolean };
  "update-framework": {
    headerHeight: number;
    sidebarWidth: number;
    layout: "vertical" | "horizontal";
  };
}>(bus);

export const fns = createFunctions(bus, {
  getFrameworkSettings: () => {
    const frameworkElement = document.querySelector("mcf-framework");
    const headerHeight = frameworkElement
      ? frameworkElement.getAttribute("header-height")
      : "0";
    const sidebarWidth = frameworkElement
      ? frameworkElement.getAttribute("sidebar-width")
      : "0";
    return {
      headerHeight,
      sidebarWidth,
    };
  },
});
