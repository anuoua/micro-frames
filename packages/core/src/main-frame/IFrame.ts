import { createUrl } from "../utils/createUrl";

const css = new CSSStyleSheet();

css.replaceSync(`
  :host {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    display: block;
  }

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
`);

export class IFrame extends HTMLElement {
  static get observedAttributes() {
    return ["origin", "baseurl", "active"];
  }

  #style = new CSSStyleSheet();

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Shadow root is not available");
    }

    this.#updateStyle(this.getAttribute("active") !== null);
    this.shadowRoot.adoptedStyleSheets = [css, this.#style];
    this.#updateIframe();
  }

  #updateIframe() {
    const url = this.getAttribute("origin")
      ? createUrl(
          this.getAttribute("origin")!,
          this.getAttribute("baseurl") || "/"
        )
      : undefined;

    this.shadowRoot!.innerHTML = `
        <iframe src="${url}"></iframe>
    `;
  }

  #updateStyle = (visible: boolean) => {
    this.#style.replaceSync(`
      :host {
        ${visible ? "" : "content-visibility: hidden;"}
        ${!visible ? "" : "z-index: 1;"}
      }
    `);
  };

  connectedCallback() {}

  disconnectedCallback() {}

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "src" || name === "baseurl") {
      this.#updateIframe();
    }

    if (name === "active") {
      this.#updateStyle(newValue !== null);
    }
  }
}
