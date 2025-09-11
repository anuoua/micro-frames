import { Frame } from "../protocol";
import { pick } from "../utils/pick";
import { parentBus } from "./parentBus";

const cssText = (
  headerHeight: number,
  sidebarWidth: number,
  layout: "vertical" | "horizontal"
) => `
  .module-frame {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: ${sidebarWidth}px 1fr;
    grid-template-rows: ${headerHeight}px 1fr;
  }

  slot[name="header"] {
    display: block;
    grid-column: ${layout === "vertical" ? 1 : 2} / -1;
    grid-row: 1 / 2;
    min-width: 0;
    min-height: 0;
  }
  
  slot[name="sidebar"] {
    display: block;
    grid-column: 1;
    grid-row: ${layout === "vertical" ? 2 : 1} / -1;
    min-width: 0;
    min-height: 0;
  }

  slot[content] {
    display: block;
    min-width: 0;
    min-height: 0;
  }
`;

export class ModuleFrame extends HTMLElement {
  #state: {
    headerHeight: number;
    sidebarWidth: number;
    layout: "vertical" | "horizontal";
  } = {
    headerHeight: 0,
    sidebarWidth: 0,
    layout: "vertical",
  };

  #style = new CSSStyleSheet();

  parentBus = parentBus;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.adoptedStyleSheets = [this.#style];
    this.shadowRoot!.innerHTML = `
      <div class="module-frame">
        <slot name="header"></slot>
        <slot name="sidebar"></slot>
        <slot content></slot>
      </div>
    `;

    this.#updateStyles();

    this.#bindEvent();

    Frame.getMainFrameConfigs().then((config) => {
      this.#state = config;
      this.#updateStyles();
    });
  }

  #bindEvent = () => {
    this.shadowRoot!.querySelector('slot[name="header"]')?.addEventListener(
      "mouseover",
      () => {
        Frame.$emit("active-main", {
          active: true,
        });
      }
    );

    this.shadowRoot!.querySelector('slot[name="sidebar"]')?.addEventListener(
      "mouseover",
      () => {
        Frame.$emit("active-main", {
          active: true,
        });
      }
    );

    this.shadowRoot!.querySelector("slot[content]")?.addEventListener(
      "mouseover",
      () => {
        Frame.$emit("active-main", {
          active: false,
        });
      }
    );

    const clone = (
      e: MouseEvent
    ): Omit<MouseEventInit, "relatedTarget" | "view"> =>
      pick(e, [
        "altKey",
        "bubbles",
        "button",
        "buttons",
        "cancelable",
        "clientX",
        "clientY",
        "composed",
        "ctrlKey",
        "detail",
        "metaKey",
        "movementX",
        "movementY",
        "screenX",
        "screenY",
        "shiftKey",
      ]);

    this.addEventListener("mousedown", (e) => {
      this.parentBus.emit("mousedown", {
        ...clone(e),
      } satisfies Omit<MouseEventInit, "relatedTarget" | "view">);
    });

    this.addEventListener("mouseup", (e) => {
      this.parentBus.emit("mouseup", {
        ...clone(e),
      } satisfies Omit<MouseEventInit, "relatedTarget" | "view">);
    });

    this.addEventListener("click", (e) => {
      this.parentBus.emit("click", {
        ...clone(e),
      } satisfies Omit<MouseEventInit, "relatedTarget" | "view">);
    });
  };

  #updateStyles = () => {
    this.#style.replaceSync(
      cssText(
        this.#state.headerHeight,
        this.#state.sidebarWidth,
        this.#state.layout
      )
    );
  };

  #updateFrameHandler = ({
    headerHeight,
    sidebarWidth,
    layout,
  }: {
    headerHeight: number;
    sidebarWidth: number;
    layout: "vertical" | "horizontal";
  }) => {
    this.#state = {
      headerHeight,
      sidebarWidth,
      layout,
    };
    this.#updateStyles();
  };

  connectedCallback() {
    this.parentBus.on("update-frame", this.#updateFrameHandler as any);
  }

  disconnectedCallback() {
    this.parentBus.on("update-frame", this.#updateFrameHandler as any);
  }
}
