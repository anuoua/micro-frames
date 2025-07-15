import {
  LocalStore,
  SessionStore,
  CookieStore2,
  Nav,
  MemoryStore,
  Frame,
} from "../protocol";
import { webComponentFrames } from "../utils/webComponentFrames";
import { IFrame } from "./IFrame";
import { MainFrame } from "./MainFrame";
import { hack } from "./nav";

export function init() {
  webComponentFrames();

  hack();

  LocalStore.registFunctions();
  SessionStore.registFunctions();
  Nav.registFunctions();
  CookieStore2.registFunctions();
  MemoryStore.registFunctions();
  Frame.registFunctions();

  customElements.define("mcf-mainframe", MainFrame);
  customElements.define("mcf-iframe", IFrame);
}
