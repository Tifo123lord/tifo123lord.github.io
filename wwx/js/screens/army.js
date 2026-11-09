// @ts-check
import { S, subscribe, liveRes } from "../core/store.js";
import { t, num, short, nm, dur, ago } from "../core/i18n.js";
import { notify, tick } from "../core/tg.js";
import { api } from "../core/api.js";
import { h, n, btn, live, empty } from "../ui/dom.js";
import { act, costView, queueBar, flagOf, unitList, errMsg } from "../ui/common.js";
import { showReport } from "../ui/battle.js";

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
    const qCard = tq.length ? h("div.card.glow", null, h("div.small.muted", null, "⏳ ", t("training"), " (", n(tq.length), "/", n(S.cfg.RULES.maxTrainBatches), ")"),
      tq.map((q, i) => { const u = S.cfg.UNITS.find((x) => x.id === q.u); const start = i ? tq[i - 1].end : Math.min(Date.now(), q.end - q.n * m.unitTimes[q.u] * 1000);
        return h("div", { style: { marginTop: "8px" } }, h("div.row.sb.small", null, h("span", null, u.icon, " ", nm(u), " ×", n(num(q.n))), live(q.end, (s) => dur(s))), i === 0 ? queueBar(q.end, (q.end - start) / 1000) : null); })) : null;
    const units = S.cfg.UNITS.map((u) => {
      const owned = Math.floor(m.units[u.id] || 0);
      const reqOk = Object.entries(u.req).every(([k, v]) => (m.buildings[k] || 0) >= v) && Object.entries(u.tech || {}).every(([k, v]) => (m.research[k] || 0) >= v);
      const reqTxt = [...Object.entries(u.req).map(([k, v]) => `${nm(S.cfg.BUILDINGS.find((x) => x.id === k))} ${v}`), ...Object.entries(u.tech || {}).map(([k, v]) => `${nm(S.cfg.TECHS.find((x) => x.id === k))} ${v}`)].join("، ");
      amounts[u.id] ??= 10;
      const inp = h("input.field.num", { type: "number", min: 1, max: S.cfg.RULES.maxTrainPerBatch, value: amounts[u.id], style: { width: "78px", padding: "7px", textAlign: "center" },
        oninput: (e) => { amounts[u.id] = Math.max(1, Math.floor(Number(e.target.value) || 1)); costEl.replaceChildren(costView(mult(u.cost, amounts[u.id]))); } });
      const costEl = h("div", null, costView(mult(u.cost, amounts[u.id])));
      const set = (v) => { tick(); amounts[u.id] = Math.max(1, v); inp.value = String(amounts[u.id]); costEl.replaceChildren(costView(mult(u.cost, amounts[u.id]))); };
      const counters = u.counters.map((c) => S.cfg.UNITS.find((x) => x.id === c)?.icon).join("");
      return h("div.card" + (!reqOk ? ".locked" : ""), null,
        h("div.row", null, h("div.ico.red", null, u.icon),
          h("div.grow", null, h("div.row.sb", null, h("b", null, nm(u)), h("span.pill", null, t("owned"), " ", n(short(owned)))),
            h("div.stats", null, h("span", null, "⚔️ ", n(u.atk)), h("span", null, "🔰 ", n(u.def)), h("span", null, "❤️ ", n(u.hp)), h("span", null, "📦 ", n(u.carry)), h("span", null, "⏱ ", n(dur(m.unitTimes[u.id])))),
            h("div.tiny", { style: { marginTop: "4px" } }, h("span.counter-chip", null, t("strong_vs"), " ", counters)))),
        reqOk ? [costEl, h("div.row", { style: { marginTop: "8px" } },
          btn("10", "ghost sm", () => set(10)), btn("50", "ghost sm", () => set(50)), btn(t("max"), "ghost sm", () => set(maxAffordable(u) || 1)), inp,
          h("div.grow"), btn("➕ " + t("train"), "success sm", async () => { await act("train", { u: u.id, n: amounts[u.id] }, { okSound: "train" }); notify("success"); }))]
          : h("div.tiny.red", { style: { marginTop: "6px" } }, "🔒 ", t("requires"), ": ", reqTxt));
    });
    root.replaceChildren(h("div.h1", null, "🪖 ", t("units"), h("span.pill.gold", { style: { marginInlineStart: "auto" } }, "💪 ", n(short(m.power)))), qCard ?? "", ...units, h("div.h2", null, h("span", null, "📜 ", t("battles"))), histBox);
  };
  const loadHist = async () => {
    try {
      const r = await api("battles");
      histBox.replaceChildren(...(r.rows.length ? r.rows.map((b) => {
        const rep = b.report, mine = rep.att.id === S.me.id, won = mine ? b.win : !b.win, other = mine ? rep.def : rep.att;
        return h("div.li", { onclick: () => showReport({ ...rep, id: b.id }), style: { cursor: "pointer" } },
          h("span.flag", null, won ? "🏆" : "💀"),
          h("div.grow", null, h("b.small", null, mine ? "⚔️ " : "🛡 ", flagOf(other.country), " ", other.name),
            h("div.tiny.muted", null, won ? t("victory") : t("defeat"), " · ", ago(Date.parse(b.created_at)), rep.war ? " · ⚔️" + t("war") : "")),
          h("span.muted", null, "›"));
      }) : [h("div.card", null, empty("🕊", t("no_battles")))]));
    } catch (e) { histBox.replaceChildren(h("div.muted.small", null, errMsg(e))); }
  };
  paint(); loadHist();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "lang" || (k === "me" && !root.contains(document.activeElement))) paint(); if (k === "battle") loadHist(); });
}
const mult = (c, k) => Object.fromEntries(Object.entries(c).map(([a, b]) => [a, b * k]));
