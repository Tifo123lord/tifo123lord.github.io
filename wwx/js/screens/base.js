// @ts-check
import { S, subscribe, affordable } from "../core/store.js";
import { RES_KEYS, RES_ICON } from "../core/config.js";
import { t, num, short, nm, desc, dur } from "../core/i18n.js";
import { notify } from "../core/tg.js";
import { h, n, btn, live } from "../ui/dom.js";
import { act, costView, queueBar } from "../ui/common.js";
import { commanderCard, openAchievements } from "../ui/profile.js";

/** @param {HTMLElement} root */
export function baseScreen(root) {
  const paint = () => {
    const m = S.me; if (!m) return;
    const today = m.daily.last === m.daily.today;
    const claimable = m.ach.filter((a) => !a.claimed && a.progress >= (S.cfg.ACHIEVEMENTS.find((x) => x.id === a.id)?.goal ?? Infinity)).length;
    const daily = h("div.card", null, h("div.row", null, h("div.ico.green", null, "🎁"),
      h("div.grow", null, h("b", null, t("daily")), h("div.tiny.muted", null, "🔥 ", n(m.daily.streak), " ", t("streak")), costView(m.daily.next)),
      today ? h("span.pill.green", null, "✓ ", t("claimed")) : btn(t("claim"), "success", async () => { const r = await act("daily", {}, { okSound: "coin" }); notify("success"); })));
    const ach = h("div.card", { onclick: openAchievements, style: { cursor: "pointer" } }, h("div.row", null, h("div.ico.gold", null, "🏅"),
      h("div.grow", null, h("b", null, t("achievements")), h("div.tiny.muted", null, n(`${num(m.ach.filter((a) => a.claimed).length)} / ${num(m.ach.length)}`))),
      claimable ? h("span.pill.gold", null, "🎁 ", n(claimable)) : h("span.muted", null, "›")));
    const prod = h("div.card", null, h("div.small.muted", null, "📈 ", t("production"), " (", t("per_hour"), ")"),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "4px", marginTop: "6px", textAlign: "center" } },
        RES_KEYS.map((r) => h("div", null, h("div", null, RES_ICON[r]), h("b.small.green", null, "+", n(short(m.rates[r]))), h("div.tiny.dim", null, n(short(m.caps[r])))))));
    const busy = m.bq[0];
    const blds = S.cfg.BUILDINGS.map((b) => {
      const lv = m.buildings[b.id] || 0, info = m.buildCosts[b.id];
      const reqOk = Object.entries(b.req || {}).every(([k, v]) => (m.buildings[k] || 0) >= v);
      const inProg = busy && busy.b === b.id;
      const maxed = lv >= b.max;
      const reqTxt = Object.entries(b.req || {}).map(([k, v]) => `${nm(S.cfg.BUILDINGS.find((x) => x.id === k))} ${v}`).join("، ");
      return h("div.card" + (inProg ? ".glow" : !reqOk ? ".locked" : ""), null,
        h("div.row", null, h("div.ico", null, b.icon),
          h("div.grow", null,
            h("div.row.sb", null, h("b", null, nm(b)), h("span.pill.lv", null, t("level"), " ", n(lv))),
            h("div.tiny.muted", null, desc(b)),
            !reqOk ? h("div.tiny.red", null, "🔒 ", t("requires"), ": ", reqTxt) : null,
            inProg ? [h("div.row.sb.tiny", { style: { marginTop: "6px" } }, h("span.cyan", null, "🔨 ", t("building_now"), " → ", n(busy.to)), live(busy.end, (s) => dur(s))), queueBar(busy.end, info.time, "blue")]
              : maxed ? h("div.tiny.gold", null, t("max")) : [costView(info.cost), h("div.tiny.dim", null, "⏱ ", n(dur(info.time)))])),
        !inProg && !maxed && reqOk ? h("div.row", { style: { marginTop: "8px", justifyContent: "flex-end" } },
          btn(lv ? `⬆️ ${t("upgrade")}` : `🏗 ${t("build")}`, affordable(info.cost) && !busy ? "success sm" : "ghost sm", async () => {
            await act("build", { b: b.id }, { okSound: "build" }); notify("success");
          }, busy ? { disabled: true } : {})) : null);
    });
    root.replaceChildren(commanderCard(), daily, ach, prod, h("div.h2", null, h("span", null, "🏗 ", t("buildings")), busy ? h("span.pill", null, "🔨 ", live(busy.end, (s) => dur(s))) : null), ...blds);
  };
  paint();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "me" || k === "lang") paint(); });
  const iv = setInterval(() => { if (!root.isConnected) return clearInterval(iv); }, 5000);
}
