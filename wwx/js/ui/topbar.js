// @ts-check
import { S, liveRes, subscribe } from "../core/store.js";
import { RES_KEYS, RES_ICON } from "../core/config.js";
import { short } from "../core/i18n.js";
import { h } from "./dom.js";
import { flagOf } from "./common.js";
import { openProfile } from "./profile.js";
import { openNotifications } from "./profile.js";

/** Persistent top bar with live-ticking resources. */
export function topbar() {
  const vals = {}, bars = {}, boxes = {};
  const resEls = RES_KEYS.map((r) => {
    vals[r] = h("div.v.num"); bars[r] = h("div.bar");
    return (boxes[r] = h("div.res", null, h("div.i", null, RES_ICON[r]), vals[r], bars[r]));
  });
  const av = h("button.avatar", { onclick: openProfile, "aria-label": "profile" });
  const bell = h("button.iconbtn", { onclick: openNotifications, "aria-label": "events" }, "🔔");
  const el = h("div.topbar", null, av, h("div.resrow", null, resEls), bell);
  let last = {};
  const paint = () => {
    const m = S.me; if (!m) return;
    av.replaceChildren(flagOf(m.country), h("span.lv", null, String(m.level)));
    for (const r of RES_KEYS) {
      const v = liveRes(r), cap = m.caps[r];
      vals[r].textContent = short(v);
      bars[r].style.width = `${Math.min(100, (v / cap) * 100)}%`;
      boxes[r].classList.toggle("full", v >= cap);
      if (last[r] != null && v - last[r] > Math.max(50, m.rates[r] / 60)) { boxes[r].classList.remove("bump"); void boxes[r].offsetWidth; boxes[r].classList.add("bump"); }
      last[r] = v;
    }
    const unseen = (m.log || []).some((x) => x.ts > Number(localStorage.getItem("wwx_seen") || 0));
    bell.querySelector(".dot")?.remove(); if (unseen) bell.append(h("span.dot"));
  };
  subscribe((k) => k === "me" && paint());
  setInterval(paint, 1000);
  paint();
  return el;
}
