import { HistoryPro } from "../history-pro";
import { Nav } from "../protocol";
import { createContext } from "../utils/createContext";

const context = createContext<{ silent?: boolean }>({
  silent: false,
});

const silentRun = <F extends (...args: any[]) => any>(fn: F) =>
  context.runWithContextValue(fn, { silent: true });

export const hack = () => {
  const historyPro = new HistoryPro();

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

    const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];
    Nav.emit("pushState", snaphost);
  };

  historyPro.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();
    originalReplaceState(state, title, url);

    if (ctx?.silent) return;

    const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];
    Nav.emit("replaceState", snaphost);
  };

  historyPro.go = (delta) => {
    const ctx = context.getContextValue();
    originalGo(delta);
    if (delta === undefined) return;
    if (ctx?.silent) return;
    Nav.emit("go", { delta, key: historyPro.getKey() });
  };

  historyPro.forward = () => {
    const ctx = context.getContextValue();
    originalForward();
    if (ctx?.silent) return;
    Nav.emit("forward", { key: historyPro.getKey() });
  };

  historyPro.back = () => {
    const ctx = context.getContextValue();
    originalBack();
    if (ctx?.silent) return;
    Nav.emit("back", { key: historyPro.getKey() });
  };

  Nav.on("pushState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;

    historyPro.pushState(state, title, url);
  });

  Nav.on("replaceState", ({ state, title, url }) => {
    // 防止循环
    if (historyPro.getKey() === HistoryPro.getKey(state)) return;
    historyPro.replaceState(state, title, url);
  });

  Nav.on("go", ({ delta, key }: { delta: number; key: string }) => {
    if (key === historyPro.getKey()) return;

    historyPro.go(delta);
  });

  Nav.on("back", ({ key }) => {
    if (key === historyPro.getKey()) return;

    historyPro.back();
  });

  Nav.on("forward", ({ key }) => {
    if (key === historyPro.getKey()) return;

    historyPro.forward();
  });

  window.addEventListener("popstate", () => {
    Nav.emit("popstate", { state: historyPro.state });
  });
};
