import * as moduleFrame from "micro-frames/module-frame";

moduleFrame.init({
  prefix: "/module/2",
}).then(() => {
  console.log("module2 ready")
});
