import * as moduleFrame from "micro-frames/module-frame";

moduleFrame.init({
  prefix: "/module/1",
}).then(() => {
  console.log('module1 inited')
});
