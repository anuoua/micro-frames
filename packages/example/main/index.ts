import * as mainFrame from "micro-frames/main-frame";

mainFrame.init();

document.querySelector("#module1")?.addEventListener("init", (e) => {
    console.log("module1 init", e);
});

document.querySelector("#module2")?.addEventListener("init", (e) => {
    console.log("module2 init", e);
});
