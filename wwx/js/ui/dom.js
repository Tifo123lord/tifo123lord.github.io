// @ts-check
import { haptic, pushBack } from "../core/tg.js";
import { sfx } from "../core/sound.js";
import { t, num } from "../core/i18n.js";

/**
 * Tiny hyperscript. h("div.card#x", {onclick}, children...)
 * @param {string} tag @param {Record<string, any>|null} [attrs] @param {...any} kids @returns {HTMLElement}
 */
export function h(tag, attrs = null, ...kids) {
  const [, name = "div", rest = ""] = /^([a-z0-9]*)(.*)$/i.exec(tag) || [];
  const el = document.createElement(name || "div");
  for (const m of rest.matchAll(/([.#])([\w-]+)/g)) m[1] === "." ? el.classList.add(m[2]) : (el.id = m[2]);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "class") el.className += " " + v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, kids);
  return el;
}
/** @param {HTMLElement} el @param {any[]} kids */
function append(el, kids) {
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
}
/** Number wrapped LTR-isolated so it renders correctly inside RTL text. @param {string|number} s @param {string} [cls] */
export const n = (s, cls = "") => h("span.num" + (cls ? "." + cls : ""), null, typeof s === "number" ? num(s) : String(s));

/** Button with built-in haptics, sound and async busy state. @param {string} label @param {string} kind @param {(e:Event)=>any} onClick */
export function btn(label, kind, onClick, extra = {}) {
  const b = h("button.btn." + kind.split(" ").join("."), { ...extra }, label);
  b.addEventListener("click", async (e) => {
    if (b.hasAttribute("disabled")) return;
    haptic("light"); sfx.tap();
    const r = onClick(e);
    if (r && typeof r.then === "function") {
      const old = b.innerHTML; b.setAttribute("disabled", ""); b.innerHTML = '<span class="spin"></span>';
      try { await r; } finally { b.removeAttribute("disabled"); if (b.isConnected) b.innerHTML = old; }
    }
  });
  return b;
}

/** @param {string} msg @param {"ok"|"err"|""} [kind] */
export function toast(msg, kind = "") {
  const box = document.getElementById("toasts"); if (!box) return;
  const el = h("div.toast" + (kind ? "." + kind : ""), null, msg);
  box.append(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 2600);
}

/**
 * Bottom sheet. Returns close(). Content builder receives close.
 * @param {(close:()=>void)=>Node|Node[]} build @param {{full?:boolean, onClose?:()=>void}} [o]
 */
export function sheet(build, o = {}) {
  let closed = false;
  const close = () => { if (closed) return; closed = true; rmBack(); bd.style.opacity = "0"; bd.style.transition = "opacity .18s"; setTimeout(() => bd.remove(), 180); o.onClose?.(); };
  const sh = h("div.sheet" + (o.full ? ".full" : ""), { onclick: (e) => e.stopPropagation() }, h("div.grab"));
  const bd = h("div.backdrop", { onclick: close }, sh);
  const content = build(close);
  append(sh, [content]);
  document.body.append(bd);
  const rmBack = pushBack(close);
  return close;
}
/** Countdown text that updates itself. @param {number} endMs @param {(left:number)=>string} fmt */
export function live(endMs, fmt) {
  const el = h("span.num");
  const upd = () => { const left = (endMs - Date.now()) / 1000; el.textContent = fmt(left); if (left > -1 && el.isConnected) setTimeout(upd, 1000); };
  queueMicrotask(upd); setTimeout(upd, 0);
  return el;
}
export const empty = (icon, text) => h("div.empty", null, h("div.e", null, icon), text);
export const closeRow = (close) => h("div.row", { style: { marginTop: "14px" } }, btn(t("close"), "ghost block", close));
