import { broadcasts } from "../protocol/wc";

const css = new CSSStyleSheet();

const cssText = (
  headerHeight: number,
  sidebarWidth: number,
  layout: "vertical" | "horizontal" = "vertical",
  headerIndex: number | string = "auto"
) => `
  .framework {
    display: grid;
    grid-template-columns: ${sidebarWidth}px 1fr;
    grid-template-rows: ${headerHeight}px 1fr;
    height: 100vh;
    width: 100vw;
  }
  
  ::slotted([slot="header"]) {
    grid-column: ${layout === "vertical" ? 1 : 2} / -1;
    grid-row: 1 / 2;
    width: 100%;
    height: 100%;
    z-index: ${headerIndex};
  }
  
  ::slotted([slot="sidebar"]) {
    grid-column: 1;
    grid-row: ${layout === "vertical" ? 2 : 1} / -1;
    width: 100%;
    height: 100%;
  }
  
  ::slotted([slot="frames"]) {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    height: 100%;
    width: 100%;
  }
`;

class Framework extends HTMLElement {
  static get observedAttributes() {
    // List of attributes to observe for changes
    return ["header-height", "sidebar-width", "layout"];
  }

  constructor() {
    super();
    this.#init();
  }

  get headerHeight() {
    return parseInt(this.getAttribute("header-height") || "50", 10);
  }

  get sidebarWidth() {
    return parseInt(this.getAttribute("sidebar-width") || "200", 10);
  }

  get layout(): "vertical" | "horizontal" {
    return (
      (this.getAttribute("layout") as "vertical" | "horizontal") || "vertical"
    );
  }

  #init() {
    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Shadow root is not available");
    }

    this.#updateStyles();
    this.shadowRoot.adoptedStyleSheets = [css];

    this.shadowRoot.innerHTML = `
        <div class="framework">
            <slot name="header"></slot>
            <slot name="sidebar"></slot>
            <slot name="frames"></slot>
        </div>
    `;
  }

  #updateStyles(headerIndex?: number | string) {
    css.replaceSync(
      cssText(this.headerHeight, this.sidebarWidth, this.layout, headerIndex)
    );
  }

  #activeHandler = (data: { active: boolean }) => {
    if (data.active) {
      this.#updateStyles(1);
    } else {
      this.#updateStyles();
    }
  };

  connectedCallback() {
    broadcasts.on("active-main", this.#activeHandler);
  }

  disconnectedCallback() {
    broadcasts.off("active-main", this.#activeHandler);
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
      broadcasts.emit("update-framework", {
        headerHeight: this.headerHeight,
        sidebarWidth: this.sidebarWidth,
        layout: this.layout,
      });
    }
  }

  adoptedCallback() {
    // This method is called when the element is moved to a new document
    console.log("Framework component adopted to a new document.");
  }
}

customElements.define("mcf-framework", Framework);
