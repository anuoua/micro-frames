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

  const originalPushState = historyPro.pushState.bind(historyPro);
  const originalReplaceState = historyPro.replaceState.bind(historyPro);

  history.pushState = (state, title, url) => {
    const ctx = context.getContextValue();
    originalPushState(state, title, url);

    if (ctx?.silent === false) {
      const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];
      Nav.emit("pushState", snaphost);
    }
  };

  history.replaceState = (state, title, url) => {
    const ctx = context.getContextValue();
    originalReplaceState(state, title, url);

    if (ctx?.silent === false) {
      const snaphost = historyPro.historyStack[historyPro.currentHistoryIndex];
      Nav.emit("replaceState", snaphost);
    }
  };

  history.go = (delta) => {
    const ctx = context.getContextValue();
    historyPro.go(delta);
    if (delta === undefined) return;
    if (ctx?.silent === false) {
      Nav.emit("go", { delta });
    }
  };

  history.forward = () => {
    const ctx = context.getContextValue();
    historyPro.forward();
    if (ctx?.silent === false) {
      Nav.emit("forward");
    }
  };

  history.back = () => {
    const ctx = context.getContextValue();
    historyPro.back();
    if (ctx?.silent === false) {
      Nav.emit("back");
    }
  };

  window.addEventListener("popstate", () => {
    Nav.emit("popstate", { state: historyPro.state });
  });
};
