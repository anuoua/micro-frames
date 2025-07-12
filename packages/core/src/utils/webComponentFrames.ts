/**
 * Framebus 在 web component 中无法正常使用
 * 原因是 window.frames 无法检测到 web compoent 中的 iframe
 * 所以我们需要做兼容，让 window.frames 能够访问到 mcf-iframe 中封装的 iframe
 */
export const webComponentFrames = () => {
  const wrap = new Proxy(window.frames, {
    get(target: any, p, receiver) {
      if (target[p] !== undefined) {
        return target[p];
      } else {
        if (
          typeof p === "string" &&
          /\d+/.test(p) &&
          (p.length > 1 ? !p.startsWith("0") : true)
        ) {
          const iframes = Array.from(document.querySelectorAll("mcf-iframe"))
            .map((i) => Array.from(i.shadowRoot!.querySelectorAll("iframe")))
            .flat();

          return iframes[Number(p) - window.length]?.contentWindow;
        }
      }
    },
  });
  Object.defineProperty(window, "frames", {
    get() {
      return wrap;
    },
  });
};
