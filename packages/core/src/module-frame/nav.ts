import { Nav } from "../protocol";
import { resolveUrl } from "../utils/resolveUrl";
import { createContext } from "../utils/createContext";
import { HistoryPro, HistorySnapshot } from "../history-pro";
import { dispatchSimulatePopstate } from "../utils/dispatchSimulatePopstate";

export interface HackOptions {
  baseURL: string;
  // 当baseURL和主路由冲突时，使用fallback作为当前路由
  fallback: string;
  initIndex: number;
  initStack: HistorySnapshot[];
  /**
   * 是否在 pushState 和 replaceState 的时候触发模拟 popstate 事件
   * 很多框架的路由库，在调用原生 history.xxx 的时候没有反应
   */
  simulatePopstate: boolean;
}

interface ContextValue {
  silent?: boolean;
  snapshot?: HistorySnapshot;
}

const context = createContext<ContextValue>({
  silent: false,
});

const silentRun = <F extends (...args: any[]) => any>(fn: F) =>
  context.runWithContextValue(fn, { silent: true });

export const hack = (props: HackOptions) => {
  const options = props;

  const historyPro = new HistoryPro({
    slaveMode: {
      initIndex: props.initIndex,
      initStack: props.initStack,
    },
  });

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
  const originalBack = historyPro.back.bind(historyPro);
  const originalForward = historyPro.forward.bind(historyPro);
  const originalGo = historyPro.go.bind(historyPro);

  historyPro.pushState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalPushState(state, title, url);

    sendSimulatePopstate();

    if (ctx?.silent) return;

    Nav.$emit("mainPushState", {
      state: historyPro.state,
      title,
      url: resolveUrl(url, options.baseURL),
    });
  };

  historyPro.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalReplaceState(state, title, url);

    sendSimulatePopstate();

    if (ctx?.silent) return;

    Nav.$emit("mainReplaceState", {
      state: historyPro.state,
      title,
      url: resolveUrl(url, options.baseURL),
    });
  };

  historyPro.back = () => {
    const ctx = context.getContextValue();

    originalBack();

    if (ctx?.silent) return;

    Nav.$emit("mainBack", {
      key: historyPro.getKey(),
    });
  };

  historyPro.forward = () => {
    const ctx = context.getContextValue();

    originalForward();

    if (ctx?.silent) return;

    Nav.$emit("mainForward", {
      key: historyPro.getKey(),
    });
  };

  historyPro.go = (delta) => {
    const ctx = context.getContextValue();

    originalGo(delta);

    if (delta === undefined) return;
    if (ctx?.silent) return;

    Nav.$emit("mainGo", { key: historyPro.getKey(), delta });
  };

  Nav.$on("modulePushState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    silentRun(historyPro.pushState)(
      state,
      title,
      url
        ? url.match(new RegExp(`${options.baseURL}\\b`))
          ? url.replace(options.baseURL, "")
          : options.fallback.replace(/\/?$/, `/${HistoryPro.getKey(state)}`)
        : url
    );
  });

  Nav.$on("moduleReplaceState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    silentRun(historyPro.replaceState)(
      state,
      title,
      url
        ? url.match(new RegExp(`${options.baseURL}\\b`))
          ? url.replace(options.baseURL, "")
          : options.fallback.replace(/\/?$/, `/${HistoryPro.getKey(state)}`)
        : url
    );
  });

  Nav.$on("moduleGo", ({ delta, key }: { delta: number; key: string }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.go)(delta);
  });

  Nav.$on("moduleBack", ({ key }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.back)();
  });

  Nav.$on("moduleForward", ({ key }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.forward)();
  });

  Nav.$on("modulePopstate", ({ state }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    const index = historyPro.historyStack.findIndex(
      (item) => HistoryPro.getKey(item.state) === HistoryPro.getKey(state)
    )!;

    silentRun(historyPro.go)(index - historyPro.currentHistoryIndex);
  });
};
