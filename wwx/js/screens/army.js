// @ts-check
import { S, subscribe, liveRes } from "../core/store.js?v=3";
import { t, num, short, nm, dur, ago } from "../core/i18n.js?v=3";
import { notify, tick } from "../core/tg.js?v=3";
import { api } from "../core/api.js?v=3";
import { h, n, btn, live, empty } from "../ui/dom.js?v=3";
import { act, costView, queueBar, flagOf, unitList, errMsg } from "../ui/common.js?v=3";
import { showReport } from "../ui/battle.js?v=3";
import { icon, entIcon, unitPhoto } from "../ui/icons.js?v=3";

/** Max units affordable right now. */
function maxAffordable(u) {
  let mx = S.cfg.RULES.maxTrainPerBatch;
  for (const [k, v] of Object.entries(u.cost)) if (v > 0) mx = Math.min(mx, Math.floor(liveRes(k) / v));
  return Math.max(0, mx);
}

/** @param {HTMLElement} root */
export function armyScreen(root) {
  const amounts = {};
  const histBox = h("div");
  const paint = () => {
    const m = S.me; if (!m) return;
    const tq = m.tq;
    const qCard = tq.length ? h("div.card.glow", null, h("div.small.muted.icrow", null, icon("clock"), t("training"), " (", n(tq.length), "/", n(S.cfg.RULES.maxTrainBatches), ")"),
      tq.map((q, i) => { const u = S.cfg.UNITS.find((x) => x.id === q.u); const start = i ? tq[i - 1].end : Math.min(Date.now(), q.end - q.n * m.unitTimes[q.u] * 1000);
        return h("div", { style: { marginTop: "8px" } }, h("div.row.sb.small", null, h("span.icrow", null, entIcon(u), nm(u), " ×", n(num(q.n))), live(q.end, (s) => dur(s))), i === 0 ? queueBar(q.end, (q.end - start) / 1000, "blue") : null); })) : null;
    const units = S.cfg.UNITS.map((u) => {
      const owned = Math.floor(m.units[u.id] || 0);
      const reqOk = Object.entries(u.req).every(([k, v]) => (m.buildings[k] || 0) >= v) && Object.entries(u.tech || {}).every(([k, v]) => (m.research[k] || 0) >= v);
      const reqTxt = [...Object.entries(u.req).map(([k, v]) => `${nm(S.cfg.BUILDINGS.find((x) => x.id === k))} ${v}`), ...Object.entries(u.tech || {}).map(([k, v]) => `${nm(S.cfg.TECHS.find((x) => x.id === k))} ${v}`)].join("، ");
      amounts[u.id] ??= 10;
      const inp = h("input.field.num", { type: "number", min: 1, max: S.cfg.RULES.maxTrainPerBatch, value: amounts[u.id], style: { width: "78px", padding: "7px", textAlign: "center" },
        oninput: (e) => { amounts[u.id] = Math.max(1, Math.floor(Number(e.target.value) || 1)); costEl.replaceChildren(costView(mult(u.cost, amounts[u.id]))); } });
      const costEl = h("div", null, costView(mult(u.cost, amounts[u.id])));
      const set = (v) => { tick(); amounts[u.id] = Math.max(1, v); inp.value = String(amounts[u.id]); costEl.replaceChildren(costView(mult(u.cost, amounts[u.id]))); };
      const counters = u.counters.map((c) => entIcon(S.cfg.UNITS.find((x) => x.id === c)));
      return h("div.card.unitcard.cat-" + u.cat + (!reqOk ? ".locked" : ""), null,
        h("div.unit-banner.has-photo", null, unitPhoto(u.id), h("div.unit-shade"),
          h("div.unit-title", null, h("b.icrow", null, entIcon(u), nm(u)), h("div.tiny.counter-chip.icrow", null, t("strong_vs"), " ", counters),
            h("span.pill.owned", null, t("owned"), " ", n(short(owned))))),
        h("div.stats", null, h("span.stat", null, icon("sword"), n(u.atk)), h("span.stat", null, icon("shield"), n(u.def)), h("span.stat", null, icon("heart"), n(u.hp)), h("span.stat", null, icon("box"), n(u.carry)), h("span.stat", null, icon("clock"), n(dur(m.unitTimes[u.id])))),
        reqOk ? [costEl, h("div.row", { style: { marginTop: "8px" } },
          btn("10", "ghost sm", () => set(10)), btn("50", "ghost sm", () => set(50)), btn(t("max"), "ghost sm", () => set(maxAffordable(u) || 1)), inp,
          h("div.grow"), btn([icon("plus"), t("train")], "success sm", async () => { await act("train", { u: u.id, n: amounts[u.id] }, { okSound: "train" }); notify("success"); }))]
          : h("div.tiny.red.icrow", { style: { marginTop: "8px" } }, icon("lock"), t("requires"), ": ", reqTxt));
    });
    root.replaceChildren(h("div.h1", null, icon("helmet"), t("units"), h("span.pill.gold", { style: { marginInlineStart: "auto" } }, icon("power"), n(short(m.power)))), qCard ?? "", ...units, h("div.h2", null, h("span.icrow", null, icon("scroll"), t("battles"))), histBox);
  };
  const loadHist = async () => {
    try {
      const r = await api("battles");
      histBox.replaceChildren(...(r.rows.length ? r.rows.map((b) => {
        const rep = b.report, mine = rep.att.id === S.me.id, won = mine ? b.win : !b.win, other = mine ? rep.def : rep.att;
        return h("div.li", { onclick: () => showReport({ ...rep, id: b.id }), style: { cursor: "pointer" } },
          h("span.flag.res-badge" + (won ? ".win" : ".loss"), null, icon(won ? "trophy" : "skull")),
          h("div.grow", null, h("b.small.icrow", null, icon(mine ? "swords" : "shield"), flagOf(other.country), other.name),
            h("div.tiny.muted", null, won ? t("victory") : t("defeat"), " · ", ago(Date.parse(b.created_at)), rep.war ? [" · ", h("span.red", null, t("war"))] : "")),
          icon("chev"));
      }) : [h("div.card", null, empty("dove", t("no_battles")))]));
    } catch (e) { histBox.replaceChildren(h("div.muted.small", null, errMsg(e))); }
  };
  paint(); loadHist();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "lang" || (k === "me" && !root.contains(document.activeElement))) paint(); if (k === "battle") loadHist(); });
}
const mult = (c, k) => Object.fromEntries(Object.entries(c).map(([a, b]) => [a, b * k]));
