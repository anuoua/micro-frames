import { HistoryPro } from "../history-pro";
import { Nav } from "../protocol";
import { ModuleFrame } from "./ModuleFrame";
import { HackOptions, hack } from "./nav";

export type initOptions = Partial<Pick<HackOptions, "baseURL" | "fallback">>;

export async function init(options: initOptions) {
  const fallback = `/${(options.fallback ?? "/404")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  const baseURL = `/${(options.baseURL ?? "/")
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  // const url = new URL(location.href);

  // const prokey = url.searchParams.get(CURRENT_KEY);
  // const preKeys = url.searchParams.get(STACK_KEYS)?.split(",");

  // // 删除微前端专用的参数，仅供内部使用
  // {
  //   url.searchParams.delete(CURRENT_KEY);
  //   url.searchParams.delete(STACK_KEYS);
  //   history.replaceState(history.state, "", url.toString());
  // }

  // const initStack = preKeys
  //   ? preKeys.map((key) => ({
  //       state: {
  //         [HistoryPro.STATE_KEY]: key,
  //       },
  //       url:
  //         prokey === key && `${options.fallback}/${key}` !== getFullPath()
  //           ? getFullPath()
  //           : `${options.fallback}/${key}`,
  //       title: "",
  //     }))
  //   : [];

  const state = await Nav.mainGetHistoryProState();

  hack({
    fallback,
    baseURL,
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
}
