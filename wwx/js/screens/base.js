// @ts-check
import { S, subscribe, affordable } from "../core/store.js?v=3";
import { RES_KEYS } from "../core/config.js?v=3";
import { icon, resIcon, entIcon } from "../ui/icons.js?v=3";
import { t, num, short, nm, desc, dur } from "../core/i18n.js?v=3";
import { notify } from "../core/tg.js?v=3";
import { h, n, btn, live } from "../ui/dom.js?v=3";
import { act, costView, queueBar } from "../ui/common.js?v=3";
import { commanderCard, openAchievements } from "../ui/profile.js?v=3";

/** @param {HTMLElement} root */
export function baseScreen(root) {
  const paint = () => {
    const m = S.me; if (!m) return;
    const today = m.daily.last === m.daily.today;
    const claimable = m.ach.filter((a) => !a.claimed && a.progress >= (S.cfg.ACHIEVEMENTS.find((x) => x.id === a.id)?.goal ?? Infinity)).length;
    const daily = h("div.card", null, h("div.row", null, h("div.ico.green", null, icon("gift")),
      h("div.grow", null, h("b", null, t("daily")), h("div.tiny.muted.icrow", null, icon("fire"), n(m.daily.streak), " ", t("streak")), costView(m.daily.next)),
      today ? h("span.pill.green", null, icon("check"), t("claimed")) : btn(t("claim"), "success", async () => { const r = await act("daily", {}, { okSound: "coin" }); notify("success"); })));
    const ach = h("div.card", { onclick: openAchievements, style: { cursor: "pointer" } }, h("div.row", null, h("div.ico.gold", null, icon("medal")),
      h("div.grow", null, h("b", null, t("achievements")), h("div.tiny.muted", null, n(`${num(m.ach.filter((a) => a.claimed).length)} / ${num(m.ach.length)}`))),
      claimable ? h("span.pill.gold", null, icon("gift"), n(claimable)) : icon("chev")));
    const prod = h("div.card", null, h("div.small.muted.icrow", null, icon("chart"), t("production"), " (", t("per_hour"), ")"),
      h("div.prodgrid", null,
        RES_KEYS.map((r) => h("div.prod.r-" + r, null, resIcon(r), h("b.small.green", null, "+", n(short(m.rates[r]))), h("div.tiny.dim", null, n(short(m.caps[r])))))));
    const busy = m.bq[0];
    const blds = S.cfg.BUILDINGS.map((b) => {
      const lv = m.buildings[b.id] || 0, info = m.buildCosts[b.id];
      const reqOk = Object.entries(b.req || {}).every(([k, v]) => (m.buildings[k] || 0) >= v);
      const inProg = busy && busy.b === b.id;
      const maxed = lv >= b.max;
      const reqTxt = Object.entries(b.req || {}).map(([k, v]) => `${nm(S.cfg.BUILDINGS.find((x) => x.id === k))} ${v}`).join("، ");
      return h("div.card" + (inProg ? ".glow" : !reqOk ? ".locked" : ""), null,
        h("div.row", null, h("div.ico.bld", null, entIcon(b)),
          h("div.grow", null,
            h("div.row.sb", null, h("b", null, nm(b)), h("span.pill.lv", null, t("level"), " ", n(lv))),
            h("div.tiny.muted", null, desc(b)),
            !reqOk ? h("div.tiny.red.icrow", null, icon("lock"), t("requires"), ": ", reqTxt) : null,
            inProg ? [h("div.row.sb.tiny", { style: { marginTop: "6px" } }, h("span.cyan.icrow", null, icon("hammer"), t("building_now"), " → ", n(busy.to)), live(busy.end, (s) => dur(s))), queueBar(busy.end, info.time, "blue")]
              : maxed ? h("div.tiny.gold", null, t("max")) : [costView(info.cost), h("div.tiny.dim.icrow", null, icon("clock"), n(dur(info.time)))])),
        !inProg && !maxed && reqOk ? h("div.row", { style: { marginTop: "8px", justifyContent: "flex-end" } },
          btn(lv ? [icon("up"), t("upgrade")] : [icon("hammer"), t("build")], affordable(info.cost) && !busy ? "success sm" : "ghost sm", async () => {
            await act("build", { b: b.id }, { okSound: "build" }); notify("success");
          }, busy ? { disabled: true } : {})) : null);
    });
    root.replaceChildren(commanderCard(), daily, ach, prod, h("div.h2", null, h("span.icrow", null, icon("factory"), t("buildings")), busy ? h("span.pill.cyanp", null, icon("hammer"), live(busy.end, (s) => dur(s))) : null), ...blds);
  };
  paint();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "me" || k === "lang") paint(); });
  const iv = setInterval(() => { if (!root.isConnected) return clearInterval(iv); }, 5000);
}
