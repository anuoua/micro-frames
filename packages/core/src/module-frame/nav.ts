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

  // @ts-expect-error
  window.historyPro = historyPro;

  const originalPushState = historyPro.pushState.bind(historyPro);
  const originalReplaceState = historyPro.replaceState.bind(historyPro);
  const originalBack = historyPro.back.bind(historyPro);
  const originalForward = historyPro.forward.bind(historyPro);
  const originalGo = historyPro.go.bind(historyPro);

  historyPro.pushState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalPushState(state, title, url);

    if (ctx?.silent) return;

    Nav.emit("pushState", {
      state: historyPro.state,
      title,
      url: resolveUrl(url, options.baseURL),
    });
  };

  historyPro.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();

    originalReplaceState(state, title, url);

    if (ctx?.silent) return;

    Nav.emit("replaceState", {
      state: historyPro.state,
      title,
      url: resolveUrl(url, options.baseURL),
    });
  };

  historyPro.back = () => {
    const ctx = context.getContextValue();

    originalBack();

    if (ctx?.silent) return;

    Nav.emit("back", {
      key: historyPro.getKey(),
    });
  };

  historyPro.forward = () => {
    const ctx = context.getContextValue();

    originalForward();

    if (ctx?.silent) return;

    Nav.emit("forward", {
      key: historyPro.getKey(),
    });
  };

  historyPro.go = (delta) => {
    const ctx = context.getContextValue();

    originalGo(delta);

    if (delta === undefined) return;
    if (ctx?.silent) return;

    Nav.emit("go", { key: historyPro.getKey(), delta });
  };

  Nav.on("pushState", ({ state, title, url }) => {
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

  Nav.on("replaceState", ({ state, title, url }) => {
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

  Nav.on("go", ({ delta, key }: { delta: number; key: string }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.go)(delta);
  });

  Nav.on("back", ({ key }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.back)();
  });

  Nav.on("forward", ({ key }) => {
    if (key === historyPro.getKey()) return;

    silentRun(historyPro.forward)();
  });

  Nav.on("popstate", ({ state }) => {
    console.log("popstate", state);

    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    const index = historyPro.historyStack.findIndex(
      (item) => HistoryPro.getKey(item.state) === HistoryPro.getKey(state)
    )!;

    silentRun(historyPro.go)(index - historyPro.currentHistoryIndex);

    window.dispatchEvent(
      new PopStateEvent("popstate", { state: historyPro.state })
    );
  });
};
