// @ts-check
/** Telegram WebApp SDK wrapper: safe no-ops outside Telegram. */
// @ts-ignore
const W = window.Telegram?.WebApp;
export const tgApp = W;
export const inTelegram = () => !!(W && W.initData);
export const initData = () => (W?.initData ?? "");
export const tgUser = () => W?.initDataUnsafe?.user ?? null;

export function initTelegram() {
  if (!W) return;
  try {
    W.ready(); W.expand();
    W.setHeaderColor?.("#070b14"); W.setBackgroundColor?.("#070b14"); W.setBottomBarColor?.("#070b14");
    W.disableVerticalSwipes?.();
  } catch { /* old clients */ }
}
/** @param {"light"|"medium"|"heavy"|"rigid"|"soft"} [s] */
export const haptic = (s = "light") => { try { W?.HapticFeedback?.impactOccurred(s); } catch {} };
/** @param {"success"|"warning"|"error"} k */
export const notify = (k) => { try { W?.HapticFeedback?.notificationOccurred(k); } catch {} };
export const tick = () => { try { W?.HapticFeedback?.selectionChanged(); } catch {} };

/** @type {(()=>void)[]} */
const backStack = [];
function syncBack() { if (!W?.BackButton) return; backStack.length ? W.BackButton.show() : W.BackButton.hide(); }
W?.BackButton?.onClick?.(() => { const fn = backStack.pop(); syncBack(); fn?.(); });
/** Push a handler that the Telegram Back button runs. Returns a remover. @param {()=>void} fn */
export function pushBack(fn) { backStack.push(fn); syncBack(); return () => { const i = backStack.indexOf(fn); if (i >= 0) backStack.splice(i, 1); syncBack(); }; }

let mainCb = /** @type {null|(()=>void)} */ (null);
/** @param {string|null} text @param {()=>void} [cb] @param {string} [color] */
export function mainButton(text, cb, color = "#1ed37a") {
  if (!W?.MainButton) return;
  if (mainCb) W.MainButton.offClick(mainCb);
  if (!text) { W.MainButton.hide(); mainCb = null; return; }
  mainCb = () => cb?.();
  W.MainButton.setParams({ text, color, text_color: "#ffffff", is_active: true, is_visible: true });
  W.MainButton.onClick(mainCb);
}
/** @param {string} msg @returns {Promise<boolean>} */
export function confirmBox(msg) {
  return new Promise((res) => { if (W?.showConfirm && inTelegram()) W.showConfirm(msg, (ok) => res(!!ok)); else res(window.confirm(msg)); });
}
