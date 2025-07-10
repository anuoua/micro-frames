import { createUrl } from "../utils/createUrl";

const css = new CSSStyleSheet();

const cssText = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

class Frame extends HTMLElement {
  static get observedAttributes() {
    return ["origin", "baseUrl"];
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

    css.replaceSync(cssText);

    this.shadowRoot.adoptedStyleSheets = [css];

    const url =
      this.getAttribute("origin") +
      "/" +
      createUrl(this.getAttribute("baseUrl") || "/");

    this.shadowRoot.innerHTML = `
        <iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
    `;
  }

  connectedCallback() {}

  disconnectedCallback() {}

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "src" || name === "baseUrl") {
      // Handle changes to src or baseUrl attributes
      console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`);
      // You can add logic here to load content based on the src or baseUrl

      const url =
        this.getAttribute("origin") +
        "/" +
        createUrl(this.getAttribute("baseUrl") || "/");

      this.shadowRoot!.innerHTML = `
          <iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
      `;
    }
  }

  adoptedCallback() {
    // This method is called when the element is moved to a new document
    console.log("Framework component adopted to a new document.");
  }
}

customElements.define("mcf-frame", Frame);
