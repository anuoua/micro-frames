import { HistoryPro } from "../history-pro";
import { Nav } from "../protocol";
import { createContext } from "../utils/createContext";

const context = createContext<{ silent?: boolean }>({
  silent: false,
});

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

  window.addEventListener("popstate", () => {
    Nav.emit("popstate", { state: historyPro.state });
  });
};
