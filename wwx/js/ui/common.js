// @ts-check
import { api, ApiError } from "../core/api.js?v=2";
import { S, setMe, liveRes, countryOf } from "../core/store.js?v=2";
import { errText, short, t, nm, dur } from "../core/i18n.js?v=2";
import { notify } from "../core/tg.js?v=2";
import { sfx } from "../core/sound.js?v=2";
import { h, n, toast } from "./dom.js?v=2";
import { resIcon, flagImg, entIcon } from "./icons.js?v=2";

/**
 * Runs a server action, applies the returned `me`, and surfaces errors uniformly.
 * @param {string} action @param {Record<string, any>} [params] @param {{quiet?:boolean, okSound?:keyof typeof sfx}} [o]
 */
export async function act(action, params = {}, o = {}) {
  try {
    const r = await api(action, params);
    if (r.me) setMe(r.me, r.now);
    if (o.okSound) sfx[o.okSound]();
    return r;
  } catch (e) {
    const code = e instanceof ApiError ? e.code : "internal";
    if (!o.quiet) { sfx.error(); notify("error"); toast(errMsg(e), "err"); }
    throw e;
  }
}
/** @param {any} e */
export function errMsg(e) {
  const code = e instanceof ApiError ? e.code : "internal";
  let m = errText(code);
  if (code === "cooldown" && e.data?.until) m += ` (${dur((e.data.until - Date.now()) / 1000)})`;
  if (code === "target_shielded" && e.data?.until) m += ` (${dur((e.data.until - Date.now()) / 1000)})`;
  if (code === "rate_limited" && e.data?.retry) m += ` (${dur(e.data.retry)})`;
  if (code === "lab_level_low" && e.data?.need) m += ` (${e.data.need})`;
  return m;
}
/** Cost chips; unaffordable parts in red. @param {Record<string, number>} cost */
export function costView(cost) {
  return h("div.cost", null, Object.entries(cost || {}).filter(([, v]) => v > 0).map(([k, v]) =>
    h("span.cc" + (liveRes(k) < v - 0.5 ? ".no" : ""), null, resIcon(k), n(short(v)))));
}
/** Flag as an element (image with emoji fallback). Use flagText() inside plain strings. */
export const flagOf = (c) => flagImg(c, countryOf(c)?.flag ?? "🏳️");
export const flagText = (c) => countryOf(c)?.flag ?? "🏳️";
export const countryName = (c) => { const x = countryOf(c); return x ? nm(x) : c; };
/** @param {Record<string, number>} b */
export const bonusText = (b) => Object.entries(b || {}).map(([k, v]) => `\u2066+${Math.round(v * 100)}%\u2069 ${t(/** @type {any} */ ("n_" + k))}`).join(" · ");
/** Unit icon list (icon + count chips). @param {Record<string, number>} u */
export function unitList(u) {
  const parts = Object.entries(u || {}).filter(([, v]) => v > 0).map(([id, v]) => h("span.uchip", null, entIcon(S.cfg.UNITS.find((x) => x.id === id) ?? { icon: "?" }), n(short(v))));
  return parts.length ? h("span.ulist", null, parts) : "—";
}
/** Progress bar for a queue item. @param {number} end @param {number} total seconds */
export function queueBar(end, total, cls = "") {
  const bar = h("i"); const box = h("div.progress" + (cls ? "." + cls : ""), null, bar);
  const upd = () => { const left = (end - Date.now()) / 1000; bar.style.width = `${Math.min(100, Math.max(2, 100 - (left / Math.max(1, total)) * 100))}%`; if (left > 0 && box.isConnected) setTimeout(upd, 1000); };
  setTimeout(upd, 0);
  return box;
}
