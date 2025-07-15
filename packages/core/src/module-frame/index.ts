import { ModuleFrame } from "./ModuleFrame";
import { hack, InitOptions } from "./nav";

export function init(options: InitOptions) {
  hack(options);

  customElements.define("mcf-moduleframe", ModuleFrame);
}
