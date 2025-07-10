import { Nav } from "../protocol";
import { resolveUrl } from "../utils/resolveUrl";
import { createContext } from "../utils/createContext";
import { HistoryPro, HistorySnapshot } from "../history-pro";
import { getFullPath } from "../utils/getFullPath";
import { CURRENT_KEY, STACK_KEYS } from "../utils/createUrl";

export interface InitOptions {
  id?: string;
  baseURL?: string;
  // 当baseURL和主路由冲突时，使用fallback作为当前路由
  fallback?: string;
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

export const hack = (props: InitOptions) => {
  const options = Object.assign(
    {
      baseURL: "/",
      fallback: "/404",
    },
    props
  ) as Required<InitOptions>;

  options.fallback = `/${options.fallback
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  options.baseURL = `/${options.baseURL
    .split("/")
    .filter((i) => !!i)
    .join("/")}`;

  const url = new URL(location.href);

  const prokey = url.searchParams.get(CURRENT_KEY);
  const preKeys = url.searchParams.get(STACK_KEYS)?.split(",");

  // 删除微前端专用的参数，仅供内部使用
  {
    url.searchParams.delete(CURRENT_KEY);
    url.searchParams.delete(STACK_KEYS);
    history.replaceState(history.state, "", url.toString());
  }

  const initStack = preKeys
    ? preKeys.map((key) => ({
        state: {
          [HistoryPro.STATE_KEY]: key,
        },
        url:
          prokey === key && `${options.fallback}/${key}` !== getFullPath()
            ? getFullPath()
            : `${options.fallback}/${key}`,
        title: "",
      }))
    : [];

  const historyPro = new HistoryPro({
    slaveMode: {
      initKey: prokey!,
      initStack: initStack,
    },
  });

  Object.defineProperty(window, "history", {
    value: historyPro,
  });

  const originalPushState = historyPro.pushState.bind(historyPro);
  const originalReplaceState = historyPro.replaceState.bind(historyPro);
  const originalBack = historyPro.back.bind(historyPro);
  const originalForward = historyPro.forward.bind(historyPro);
  const originalGo = historyPro.go.bind(historyPro);

  history.pushState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalPushState(state, title, url);

    ctx?.silent === false &&
      Nav.functions.pushState(
        history.state,
        title,
        resolveUrl(url, options.baseURL)
      );
  };

  history.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalReplaceState(state, title, url);

    ctx?.silent === false &&
      Nav.functions.replaceState(
        history.state,
        title,
        resolveUrl(url, options.baseURL)
      );
  };

  history.back = () => {
    const ctx = context.getContextValue();
    originalBack();
    ctx?.silent === false && Nav.functions.back();
  };

  history.forward = () => {
    const ctx = context.getContextValue();
    originalForward();
    ctx?.silent === false && Nav.functions.forward();
  };

  history.go = (delta) => {
    const ctx = context.getContextValue();
    originalGo(delta);
    if (delta === undefined) return;
    ctx?.silent === false && Nav.functions.go(delta);
  };

  Nav.on("pushState", ({ state, title, url }) => {
    // 防止循环
    if (
      historyPro.historyStack
        .map((i) => HistoryPro.getKey(i.state))
        .includes(HistoryPro.getKey(state))
    )
      return;

    silentRun(history.pushState.bind(history))(
      state,
      title,
      url
        ? url.match(new RegExp(`${options.baseURL}\\b`))
          ? url.replace(options.baseURL, "")
          : options.fallback.replace(/\/?$/, `/${HistoryPro.getKey(state)}`)
        : url
    );
  });

  Nav.on("replaceState", ({ state, title, url }) => {
    // 防止循环
    if (HistoryPro.getKey(historyPro.state) === HistoryPro.getKey(state))
      return;
    silentRun(history.replaceState.bind(history))(
      state,
      title,
      url
        ? url.match(new RegExp(`${options.baseURL}\\b`))
          ? url.replace(options.baseURL, "")
          : options.fallback.replace(/\/?$/, `/${HistoryPro.getKey(state)}`)
        : url
    );
  });

  const go = ({ delta }: { delta: number }) => {
    // 防止循环
    if (
      historyPro.currentHistoryIndex + delta < 0 ||
      historyPro.currentHistoryIndex + delta >= historyPro.historyStack.length
    )
      return;

    silentRun(history.go.bind(history))(delta);
  };

  Nav.on("go", go);

  Nav.on("back", () => {
    go({ delta: -1 });
  });

  Nav.on("forward", () => {
    go({ delta: 1 });
  });

  Nav.on("popstate", ({ state }) => {
    // 防止循环
    if (HistoryPro.getKey(historyPro.state) === HistoryPro.getKey(state))
      return;

    const index = historyPro.historyStack.findIndex(
      (item) => HistoryPro.getKey(item.state) === HistoryPro.getKey(state)
    )!;

    silentRun(history.go.bind(history))(index - historyPro.currentHistoryIndex);

    window.dispatchEvent(
      new PopStateEvent("popstate", { state: history.state })
    );
  });
};
