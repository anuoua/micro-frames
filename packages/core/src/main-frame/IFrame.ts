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
    return ["src", "active"];
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
    const src = this.getAttribute("src");

    this.shadowRoot!.innerHTML = `
        <iframe src="${src}"></iframe>
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
    if (name === "src") {
      this.#updateIframe();
    }

    if (name === "active") {
      this.#updateStyle(newValue !== null);
    }
  }
}
