import { HistoryPro } from "../history-pro";
import { Nav } from "../protocol";
import { createContext } from "../utils/createContext";
import { dispatchSimulatePopstate } from "../utils/dispatchSimulatePopstate";

const context = createContext<{ silent?: boolean }>({
  silent: false,
});

export interface HackOptions {
  /**
   * 是否在 pushState 和 replaceState 的时候触发模拟 popstate 事件
   * 很多框架的路由库，在调用原生 history.xxx 的时候没有反应
   */
  simulatePopstate: boolean;
}

export const hack = (options: HackOptions) => {
  const historyPro = new HistoryPro();

  Object.defineProperty(window, "history", {
    value: historyPro,
  });

  // @ts-expect-error
  window.historyPro = historyPro;

  const sendSimulatePopstate = () => {
    if (!options.simulatePopstate) return;
    dispatchSimulatePopstate(historyPro.state);
  };

  const originalPushState = historyPro.pushState.bind(historyPro);
  const originalReplaceState = historyPro.replaceState.bind(historyPro);

  historyPro.pushState = (state, title, url) => {
    const ctx = context.getContextValue();
    originalPushState(state, title, url);

    sendSimulatePopstate();

    if (ctx?.silent) return;

    const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];

    Nav.$emit("modulePushState", snaphost);
  };

  historyPro.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalReplaceState(state, title, url);

    sendSimulatePopstate();

    if (ctx?.silent) return;

    const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];
    Nav.$emit("moduleReplaceState", snaphost);
  };

  Nav.$on("mainPushState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    historyPro.pushState(state, title, url);
  });

  Nav.$on("mainReplaceState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    historyPro.replaceState(state, title, url);
  });

  Nav.$on("mainGo", ({ delta, key }: { delta: number; key: string }) => {
    if (key === historyPro.getKey()) return;

    historyPro.go(delta);
  });

  Nav.$on("mainBack", ({ key }) => {
    if (key === historyPro.getKey()) return;

    historyPro.back();
  });

  Nav.$on("mainForward", ({ key }) => {
    if (key === historyPro.getKey()) return;

    historyPro.forward();
  });

  window.addEventListener("popstate", (e) => {
    // @ts-expect-error
    if (e.isSimulate) return;
    Nav.$emit("modulePopstate", { state: historyPro.state });
  });
};
