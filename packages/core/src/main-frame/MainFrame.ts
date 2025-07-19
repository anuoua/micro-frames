import { Frame } from "../protocol";

const cssText = (
  headerHeight: number,
  sidebarWidth: number,
  layout: "vertical" | "horizontal" = "vertical",
  headerIndex: number | string = "auto"
) => `
  .main-frame {
    display: grid;
    grid-template-columns: ${sidebarWidth}px 1fr;
    grid-template-rows: ${headerHeight}px 1fr;
    height: 100vh;
    width: 100vw;
  }
  
  slot[name="header"] {
    display: block;
    grid-column: ${layout === "vertical" ? 1 : 2} / -1;
    grid-row: 1 / 2;
    z-index: ${headerIndex};
    min-width: 0;
    min-height: 0;
  }
  
  slot[name="sidebar"] {
    display: block;
    grid-column: 1;
    grid-row: ${layout === "vertical" ? 2 : 1} / -1;
    z-index: ${headerIndex};
    min-width: 0;
    min-height: 0;
  }

  slot[name="content"] {
    grid-column: 1 / -1;
    grid-row: 2 / -1;
    min-width: 0;
    min-height: 0;
  }
  
  slot[name="frames"] {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    min-width: 0;
    min-height: 0;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
`;

export class MainFrame extends HTMLElement {
  static get observedAttributes() {
    // List of attributes to observe for changes
    return ["header-height", "sidebar-width", "layout"];
  }

  #style = new CSSStyleSheet();

  get #props() {
    return {
      headerHeight: parseInt(this.getAttribute("header-height") || "0", 10),
      sidebarWidth: parseInt(this.getAttribute("sidebar-width") || "0", 10),
      layout:
        (this.getAttribute("layout") as "vertical" | "horizontal") ||
        "vertical",
    };
  }

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Shadow root is not available");
    }

    this.#updateStyles();
    this.shadowRoot.adoptedStyleSheets = [this.#style];

    this.shadowRoot.innerHTML = `
        <div class="main-frame">
            <slot name="header"></slot>
            <slot name="sidebar"></slot>
            <slot name="content"></slot>
            <slot name="frames"></slot>
        </div>
    `;
  }

  #updateStyles = (headerIndex?: number | string) => {
    this.#style.replaceSync(
      cssText(
        this.#props.headerHeight,
        this.#props.sidebarWidth,
        this.#props.layout,
        headerIndex
      )
    );
  };

  #activeHandler = (data: { active: boolean }) => {
    if (data.active) {
      this.#updateStyles(3);
    } else {
      this.#updateStyles();
    }
  };

  connectedCallback() {
    Frame.$on("active-main", this.#activeHandler);
  }

  disconnectedCallback() {
    Frame.$off("active-main", this.#activeHandler);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (
      name === "header-height" ||
      name === "sidebar-width" ||
      name === "layout"
    ) {
      this.#updateStyles();
      Frame.$emit("update-frame", this.#props);
    }
  }
}
