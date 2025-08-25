import { HistoryPro } from "../history-pro";
import { Frame, Nav } from "../protocol";
import { ModuleFrame } from "./ModuleFrame";
import { HackOptions, hack } from "./nav";

export type initOptions = Partial<
  Pick<HackOptions, "prefix" | "fallback" | "simulatePopstate">
>;

export async function init(options: initOptions) {
  const fallback = `/${(options.fallback ?? "/404")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  const prefix = `/${(options.prefix ?? "/")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  customElements.define("mcf-moduleframe", ModuleFrame);

  Frame.$emit("module-inited", options);

  const activeIframeSrc = await Frame.getActiveIframe();

  if (activeIframeSrc && new URL(activeIframeSrc).pathname.startsWith(prefix)) {
  } else {
    await waitActive(prefix);
  }

  const state = await Nav.mainGetHistoryProState();

  hack({
    fallback,
    prefix: prefix,
    simulatePopstate: options.simulatePopstate ?? true,
    initIndex: state.currentHistoryIndex,
    initStack: state.historyStack.map((i) => ({
      ...i,
      url: i.url
        ? new RegExp("^" + prefix + "\\b").test(i.url)
          ? i.url.replace(prefix, "") || "/"
          : `${fallback}/${i.state[HistoryPro.STATE_KEY]}`
        : i.url,
    })),
  });
}

const waitActive = (prefix: string) => {
  return new Promise<boolean>((res) => {
    let handler: (src: string) => void;
    Frame.$on(
      "module-active",
      (handler = (src) => {
        if (new URL(src).pathname.startsWith(prefix)) {
          res(true);
          Frame.$off("module-active", handler);
        }
      })
    );
  });
};
