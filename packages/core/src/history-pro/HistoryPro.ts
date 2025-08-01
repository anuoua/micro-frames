import { dispatchSimulatePopstate } from "../utils/dispatchSimulatePopstate";

export interface HistorySnapshot {
  title: string;
  url: string | null | undefined;
  state: any;
  [index: string]: any;
}

export const SESSION_HISTORY_STACK_KEY = "$$history-stack$$";
export const SESSION_HISTORY_INDEX_KEY = "$$history-index$$";

const originHistory = history;

const originalPushState = history.pushState.bind(history);
const originalReplaceState = history.replaceState.bind(history);
const originalGo = history.go.bind(history);

const hrefToFullPath = (href: string) => {
  const newURL = new URL(href);
  return `${newURL.pathname}${newURL.search}${newURL.hash}`;
};

export interface HistoryProOptions {
  // 奴隶模式，历史记录仅保存在内存中，不会生成浏览器历史记录，用于微前端
  slaveMode?: {
    // 奴隶模式下，需要一个来自主 history 的index，用于初始化
    initIndex: number;
    // 奴隶模式下，有时候半路加载一个模块，需要补充之前缺失的栈
    initStack: HistorySnapshot[];
  };
}

export class HistoryPro implements History {
  static STATE_KEY = "$_prokey";

  static MAX_HISTORY_STACK_LENGTH = 30;

  static composeState = (state: any = {}) => {
    return {
      ...state,
      [HistoryPro.STATE_KEY]:
        state?.[HistoryPro.STATE_KEY] ?? HistoryPro.genKey(),
    };
  };

  static genKey = () => Math.random().toString(36).substring(2, 15);

  static getKey = (state: any) => state?.[HistoryPro.STATE_KEY];

  // 源始history对象
  originHistory = originHistory;

  // 历史栈
  historyStack: HistorySnapshot[] = [];

  // 当前历史索引
  currentHistoryIndex = -1;

  constructor(public options: HistoryProOptions = {}) {
    this.#init();
    this.#bindEvents();
  }

  #init() {
    if (this.options.slaveMode) {
      this.#slaveInit(this.options.slaveMode!);
    } else {
      this.#mainInit();
    }

    this.#writeToSessionStorage();

    originalReplaceState(
      this.historyStack[this.currentHistoryIndex].state,
      this.historyStack[this.currentHistoryIndex].title,
      this.historyStack[this.currentHistoryIndex].url
    );
  }

  #mainInit() {
    const hasSession = !!sessionStorage.getItem(SESSION_HISTORY_INDEX_KEY);

    this.historyStack = hasSession
      ? JSON.parse(sessionStorage.getItem(SESSION_HISTORY_STACK_KEY)!)
      : ([
          {
            state: {
              [HistoryPro.STATE_KEY]: "root",
            },
            url: hrefToFullPath(location.href),
            title: "",
          },
        ] satisfies HistorySnapshot[]);

    this.currentHistoryIndex = hasSession
      ? Number(sessionStorage.getItem(SESSION_HISTORY_INDEX_KEY))
      : 0;

    const navtime = performance.getEntriesByType(
      "navigation"
    )[0] as unknown as { type: "navigate" | "reload" | "back_forward" };

    if (hasSession) {
      if (navtime.type === "navigate") {
        this.currentHistoryIndex++;
        this.historyStack.splice(this.currentHistoryIndex);
        this.historyStack[this.currentHistoryIndex] = {
          state: {
            [HistoryPro.STATE_KEY]: HistoryPro.genKey(),
          },
          url: hrefToFullPath(location.href),
          title: "",
        };
      }

      if (navtime.type === "back_forward") {
        const index = this.historyStack.findIndex(
          (i) => HistoryPro.getKey(i.state) === HistoryPro.getKey(this.state)
        );
        this.currentHistoryIndex = index;
      }
    }
  }

  #slaveInit(slaveMode: Exclude<HistoryProOptions["slaveMode"], undefined>) {
    this.historyStack = slaveMode.initStack;
    this.currentHistoryIndex = slaveMode.initIndex;
  }

  #bindEvents() {
    window.addEventListener("popstate", (event) => {
      const index = this.historyStack.findIndex(
        (item) =>
          item.state?.[HistoryPro.STATE_KEY] ===
          event.state?.[HistoryPro.STATE_KEY]
      );

      if (index < 0) {
        return;
      }

      const currentSnapshot = this.historyStack[index];

      if (index === this.currentHistoryIndex - 1) {
        window.dispatchEvent(
          new CustomEvent("back", {
            detail: {
              state: currentSnapshot.state,
              title: currentSnapshot.title,
              url: currentSnapshot.url,
            },
          })
        );
      } else if (index === this.currentHistoryIndex + 1) {
        window.dispatchEvent(
          new CustomEvent("forward", {
            detail: {
              state: currentSnapshot.state,
              title: currentSnapshot.title,
              url: currentSnapshot.url,
            },
          })
        );
      }

      this.currentHistoryIndex = index;
      this.#writeToSessionStorage();
    });
  }

  #writeToSessionStorage() {
    if (this.options.slaveMode) return;
    sessionStorage.setItem(
      SESSION_HISTORY_STACK_KEY,
      JSON.stringify(this.historyStack)
    );
    sessionStorage.setItem(
      SESSION_HISTORY_INDEX_KEY,
      String(this.currentHistoryIndex)
    );
  }

  #checkLength() {
    if (this.historyStack.length > HistoryPro.MAX_HISTORY_STACK_LENGTH) {
      this.historyStack = this.historyStack.slice(-HistoryPro.MAX_HISTORY_STACK_LENGTH);
      this.currentHistoryIndex = HistoryPro.MAX_HISTORY_STACK_LENGTH - 1;
    }
  }

  getKey() {
    return HistoryPro.getKey(this.state);
  }

  get length(): number {
    return originHistory.length;
  }

  get state(): any {
    return originHistory.state;
  }

  get scrollRestoration(): ScrollRestoration {
    return originHistory.scrollRestoration;
  }

  set scrollRestoration(scrollRestoration: ScrollRestoration) {
    originHistory.scrollRestoration = scrollRestoration;
  }

  pushState(data: any, unused: string, url?: string | URL | null): void {
    const newSnapshot: HistorySnapshot = {
      state: HistoryPro.composeState(data),
      url: url ? (url instanceof URL ? hrefToFullPath(url.href) : url) : url,
      title: unused,
    };
    if (this.currentHistoryIndex < this.historyStack.length - 1) {
      this.historyStack.splice(this.currentHistoryIndex + 1);
    }
    this.historyStack.push(newSnapshot);
    this.currentHistoryIndex++;
    if (this.options.slaveMode) {
      originalReplaceState(newSnapshot.state, unused, url);
    } else {
      originalPushState(newSnapshot.state, unused, url);
    }
    this.#checkLength();
    this.#writeToSessionStorage();
  }

  replaceState(data: any, unused: string, url?: string | URL | null): void {
    const newSnapshot: HistorySnapshot = {
      state: HistoryPro.composeState(data),
      url: url ? (url instanceof URL ? hrefToFullPath(url.href) : url) : url,
      title: unused,
    };
    this.historyStack[this.currentHistoryIndex] = newSnapshot;
    originalReplaceState(newSnapshot.state, unused, url);
    this.#writeToSessionStorage();
  }

  #_go(delta: number): void {
    const newIndex = this.currentHistoryIndex + delta;
    if (newIndex < 0 || newIndex >= this.historyStack.length) {
      return;
    }
    if (this.options.slaveMode) {
      originalReplaceState(
        this.historyStack[newIndex].state,
        this.historyStack[newIndex].title,
        this.historyStack[newIndex].url
      );
    } else {
      originalGo(delta);
    }
    this.currentHistoryIndex = newIndex;
    this.#writeToSessionStorage();

    if (this.options.slaveMode) {
      dispatchSimulatePopstate(this.state);
    }
  }

  go(delta?: number): void {
    if (delta === undefined) {
      originalGo();
      return;
    }
    this.#_go(delta);
  }

  back(): void {
    this.#_go(-1);
  }

  forward(): void {
    this.#_go(1);
  }
}
