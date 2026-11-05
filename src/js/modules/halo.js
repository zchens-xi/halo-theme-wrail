const WIDGET_SELECTOR = "#comment div div";

function widget() {
  const holder = document.querySelector(WIDGET_SELECTOR);
  if (!holder || !holder.shadowRoot) return null;
  return holder.shadowRoot.querySelector(".halo-comment-widget");
}

function applyMode(mode) {
  const el = widget();
  if (!el) return false;
  const want = mode === "dark" ? "dark" : "light";
  const other = want === "dark" ? "light" : "dark";
  if (el.classList.contains(other)) {
    el.classList.replace(other, want);
  } else if (!el.classList.contains(want)) {
    el.classList.add(want);
  }
  return true;
}

function pageMode() {
  const attr = document.documentElement.getAttribute("data-mode");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default {
  /* 让评论组件主题跟随页面（首次加载、系统主题变化都生效） */
  syncMode(mode) {
    return applyMode(mode || pageMode());
  },

  /* 仅翻转，保留给旧调用方 */
  flipMode() {
    const el = widget();
    if (!el) return;
    applyMode(el.classList.contains("dark") ? "light" : "dark");
  },

  /*
   * 评论组件是异步渲染的，且页面首次加载时没有任何人会去同步它的主题，
   * 于是暗色模式下评论文字几乎不可见。这里做两件事：
   *   1. 渲染出来后按页面模式同步一次（轮询兜底，最多 ~6s）
   *   2. 监听 html[data-mode] 变化，随手切换页面主题时也同步
   */
  initAutoSync() {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (applyMode(pageMode()) || tries > 30) clearInterval(timer);
    }, 200);
    applyMode(pageMode());

    const target = document.documentElement;
    if (window.MutationObserver && target) {
      new MutationObserver(() => applyMode(pageMode())).observe(target, {
        attributes: true,
        attributeFilter: ["data-mode"],
      });
    }
  },
};
