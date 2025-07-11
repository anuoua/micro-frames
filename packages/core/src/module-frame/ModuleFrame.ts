import { Frame } from "../protocol";

const cssText = (headerHeight: number, sidebarWidth: number) => `
  .module-frame {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: ${sidebarWidth}px 1fr;
    grid-template-rows: ${headerHeight}px 1fr;
  }

  slot[name="header"] {
    display: block;
    grid-column: 1 / -1;
    grid-row: 1 / 2;
  }
  
  slot[name="sidebar"] {
    display: block;
    grid-column: 1;
    grid-row: 2 / -1;
  }
`;

export class ModuleFrame extends HTMLElement {
  #state: {
    headerHeight: number;
    sidebarWidth: number;
  } = {
    headerHeight: 0,
    sidebarWidth: 0,
  };

  #style = new CSSStyleSheet();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.adoptedStyleSheets = [this.#style];
    this.shadowRoot!.innerHTML = `
      <div class="module-frame">
        <slot name="header"></slot>
        <slot name="sidebar"></slot>
        <slot style="display: block;"></slot>
      </div>
    `;

    this.#updateStyles();

    Frame.functions.getMainFrameConfigs().then((config) => {
      this.#state = config;
      this.#updateStyles();
    });
  }

  #updateStyles = () => {
    this.#style.replaceSync(
      cssText(this.#state.headerHeight, this.#state.sidebarWidth)
    );
  };

  #updateFrameHandler = ({
    headerHeight,
    sidebarWidth,
  }: {
    headerHeight: number;
    sidebarWidth: number;
    layout: "vertical" | "horizontal";
  }) => {
    console.log("updateFrameHandler");

    this.#state = {
      headerHeight,
      sidebarWidth,
    };
    this.#updateStyles();
  };

  connectedCallback() {
    Frame.on("update-frame", this.#updateFrameHandler);
  }

  disconnectedCallback() {
    Frame.off("update-frame", this.#updateFrameHandler);
  }
}
