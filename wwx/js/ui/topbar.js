// @ts-check
import { S, liveRes, subscribe } from "../core/store.js?v=3";
import { RES_KEYS } from "../core/config.js?v=3";
import { resIcon, icon } from "./icons.js?v=3";
import { short } from "../core/i18n.js?v=3";
import { h } from "./dom.js?v=3";
import { flagOf } from "./common.js?v=3";
import { openProfile } from "./profile.js?v=3";
import { openNotifications } from "./profile.js?v=3";

/** Persistent top bar with live-ticking resources. */
export function topbar() {
  const vals = {}, bars = {}, boxes = {};
  const resEls = RES_KEYS.map((r) => {
    vals[r] = h("div.v.num"); bars[r] = h("div.bar");
    return (boxes[r] = h("div.res.r-" + r, null, h("div.i", null, resIcon(r)), vals[r], bars[r]));
  });
  const av = h("button.avatar", { onclick: openProfile, "aria-label": "profile" });
  const bell = h("button.iconbtn", { onclick: openNotifications, "aria-label": "events" }, icon("bell"));
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
