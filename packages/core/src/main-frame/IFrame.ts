import Framebus from "framebus";

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

  #ifarmeBus: Framebus | undefined;

  get iframeBus() {
    if (this.#ifarmeBus) {
      return this.#ifarmeBus;
    } else {
      this.#ifarmeBus = new Framebus({
        channel: "MCF:OneToOne",
        targetFrames: [this.shadowRoot!.querySelector("iframe")!],
      });

      return this.#ifarmeBus;
    }
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

  #getIsActive(reply: any) {
    reply(this.getAttribute("active") != null);
  }

  connectedCallback() {
    this.iframeBus.on("init", () =>
      this.dispatchEvent(new CustomEvent("init"))
    );
    this.iframeBus.on("getIsActive", this.#getIsActive.bind(this));
    this.iframeBus.on(
      "mouseup",
      (data: Omit<MouseEventInit, "relatedTarget" | "view">) =>
        this.dispatchEvent(new MouseEvent("mouseup", data))
    );
    this.iframeBus.on(
      "mousedown",
      (data: Omit<MouseEventInit, "relatedTarget" | "view">) =>
        this.dispatchEvent(new MouseEvent("mousedown", data))
    );
    this.iframeBus.on(
      "click",
      (data: Omit<MouseEventInit, "relatedTarget" | "view">) =>
        this.dispatchEvent(new MouseEvent("click", data))
    );
  }

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
      if (newValue == null) {
        this.iframeBus.emit("module-inactive");
      } else {
        this.iframeBus.emit("module-active");
      }
    }
  }
}
