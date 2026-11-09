// @ts-check
import { S, subscribe, affordable } from "../core/store.js";
import { t, nm, desc, dur, num } from "../core/i18n.js";
import { notify } from "../core/tg.js";
import { h, n, btn, live } from "../ui/dom.js";
import { act, costView, queueBar } from "../ui/common.js";

/** @param {HTMLElement} root */
export function researchScreen(root) {
  const paint = () => {
    const m = S.me; if (!m) return;
    const lab = m.buildings.research_lab || 0, busy = m.rq[0];
    const branches = [["eco", "💹"], ["mil", "🎖"], ["ops", "🕶"]];
    const out = [h("div.h1", null, "🔬 ", t("research"), h("span.pill", { style: { marginInlineStart: "auto" } }, "🔬 ", t("lab_need"), " ", n(lab)))];
    if (busy) {
      const tech = S.cfg.TECHS.find((x) => x.id === busy.t);
      out.push(h("div.card.glow", null, h("div.row.sb", null, h("b", null, tech.icon, " ", nm(tech), " → ", n(busy.to)), live(busy.end, (s) => dur(s))), queueBar(busy.end, m.techCosts[busy.t]?.time || 60, "gold")));
    }
    for (const [br, ic] of branches) {
      out.push(h("div.h2", null, h("span", null, ic, " ", t(/** @type {any} */ ("branch_" + br)))));
      for (const x of S.cfg.TECHS.filter((y) => y.branch === br)) {
        const lv = m.research[x.id] || 0, info = m.techCosts[x.id], need = x.lab + lv;
        const reqOk = Object.entries(x.req || {}).every(([k, v]) => (m.research[k] || 0) >= v);
        const labOk = lab >= need, maxed = lv >= x.max, inProg = busy && busy.t === x.id;
        const reqTxt = Object.entries(x.req || {}).map(([k, v]) => `${nm(S.cfg.TECHS.find((y) => y.id === k))} ${v}`).join("، ");
        out.push(h("div.card" + (inProg ? ".glow" : !labOk || !reqOk ? ".locked" : ""), null,
          h("div.row", null, h("div.ico.violet", null, x.icon),
            h("div.grow", null, h("div.row.sb", null, h("b", null, nm(x)), h("span.pill", null, n(`${num(lv)}/${num(x.max)}`))),
              h("div.tiny.muted", null, desc(x)),
              h("div.row", { style: { gap: "3px", marginTop: "5px" } }, Array.from({ length: x.max }, (_, i) => h("i", { style: { flex: 1, height: "4px", borderRadius: "3px", background: i < lv ? "var(--violet)" : "rgba(255,255,255,.08)" } }))),
              maxed ? h("div.tiny.gold", { style: { marginTop: "4px" } }, t("max")) : [costView(info.cost), h("div.tiny.dim", null, "⏱ ", n(dur(info.time)), !labOk ? h("span.red", null, " · 🔒 ", t("lab_need"), " ", n(need)) : null, !reqOk ? h("span.red", null, " · 🔒 ", reqTxt) : null)])),
          !maxed && !inProg && labOk && reqOk ? h("div.row", { style: { marginTop: "8px", justifyContent: "flex-end" } },
            btn("🔬 " + t("research"), affordable(info.cost) && !busy ? "violet sm" : "ghost sm", async () => { await act("research", { t: x.id }, { okSound: "build" }); notify("success"); }, busy ? { disabled: true } : {})) : null));
      }
    }
    root.replaceChildren(...out);
  };
  paint();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "me" || k === "lang") paint(); });
}
