import { HistoryPro } from "../history-pro";
import { Frame, Nav } from "../protocol";
import { ModuleFrame } from "./ModuleFrame";
import { HackOptions, hack } from "./nav";

export type initOptions = Partial<
  Pick<HackOptions, "baseURL" | "fallback" | "simulatePopstate">
>;

export async function init(options: initOptions) {
  const fallback = `/${(options.fallback ?? "/404")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  const baseURL = `/${(options.baseURL ?? "/")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  const state = await Nav.mainGetHistoryProState();

  hack({
    fallback,
    baseURL,
    simulatePopstate: options.simulatePopstate ?? true,
    initIndex: state.currentHistoryIndex,
    initStack: state.historyStack.map((i) => ({
      ...i,
      url: i.url
        ? new RegExp("^" + baseURL + "\\b").test(i.url)
          ? i.url.replace(baseURL, "") || "/"
          : `${fallback}/${i.state[HistoryPro.STATE_KEY]}`
        : i.url,
    })),
  });

  customElements.define("mcf-moduleframe", ModuleFrame);

  Frame.$emit("module-inited", options);
}
