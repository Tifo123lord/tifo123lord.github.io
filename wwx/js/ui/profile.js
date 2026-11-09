// @ts-check
import { S, emit } from "../core/store.js";
import { t, num, short, getLang, setLang, ago, dur, nm, desc } from "../core/i18n.js";
import { soundOn, setSound, sfx } from "../core/sound.js";
import { notify } from "../core/tg.js";
import { h, n, btn, sheet, closeRow, empty, live } from "./dom.js";
import { act, flagOf, countryName, bonusText, unitList, costView } from "./common.js";
import { RES_ICON } from "../core/config.js";

export function commanderCard() {
  const m = S.me;
  const span = Math.max(1, m.xpNext - m.xpCur), pct = Math.min(100, ((m.xp - m.xpCur) / span) * 100);
  const si = m.seasonInfo;
  return h("div.card.glow", null,
    h("div.row", null,
      h("div.ico.gold", { style: { fontSize: "30px" } }, flagOf(m.country)),
      h("div.grow", null,
        h("div.row.sb", null, h("b.ellipsis", null, m.name), h("span.pill.lv", null, "⭐ ", t("level"), " ", n(m.level))),
        h("div.small.muted", null, countryName(m.country), " · ", t("power"), " ", n(short(m.power), "gold")),
        h("div.xpbar", { style: { marginTop: "6px" } }, h("i", { style: { width: pct + "%" } })),
        h("div.tiny.dim", { style: { marginTop: "3px" } }, "XP ", n(`${short(m.xp - m.xpCur)} / ${short(span)}`)))),
    h("div.row.sb", { style: { marginTop: "10px" } },
      h("div.small", null, "🏅 ", t("season"), " ", n(m.season.id), ": ", n(num(m.season.pts), "gold"), " ", t("season_pts")),
      h("div.tiny.muted", null, t("ends"), " ", live(si.end, (s) => dur(s)))));
}

export function openProfile() {
  const m = S.me; if (!m) return;
  sheet((close) => {
    const cfgC = S.cfg.COUNTRIES.find((c) => c.id === m.country);
    const st = m.stats || {};
    const soundBtn = h("div.seg", null,
      h("button" + (soundOn() ? ".on" : ""), { onclick: () => { setSound(true); sfx.coin(); close(); openProfile(); } }, "🔊 ", t("on")),
      h("button" + (!soundOn() ? ".on" : ""), { onclick: () => { setSound(false); close(); openProfile(); } }, "🔇 ", t("off")));
    const langBtn = h("div.seg", null,
      h("button" + (getLang() === "fa" ? ".on" : ""), { onclick: () => switchLang("fa", close) }, "فارسی"),
      h("button" + (getLang() === "en" ? ".on" : ""), { onclick: () => switchLang("en", close) }, "English"));
    return [
      h("div.h1", null, "👤 ", t("profile")),
      commanderCard(),
      h("div.card", null,
        h("div.small.muted", null, t("start_bonus")), h("div.green.small", null, bonusText(cfgC?.bonus)),
        h("div.grid2", { style: { marginTop: "10px" } },
          kv("⚔️ " + t("wins"), st.wins), kv("💀 " + t("losses"), st.losses), kv("🛡 " + t("def_wins"), st.defWins),
          kv("🕵️ " + t("spies"), st.spyOk), kv("📦 " + t("looted"), st.looted), kv("🔥 " + t("streak"), m.daily.streak))),
      m.seasons?.length ? h("div.card", null, h("div.small.muted", null, "🏆 " + t("season")),
        m.seasons.map((s) => h("div.kv", null, h("span", null, t("season"), " ", n(s.id)), h("span", null, n(num(s.pts), "gold"), " · ", n(s.wins), " ", t("wins"))))) : null,
      h("div.h2", null, "⚙️ " + t("settings")),
      h("div.card", null, h("div.small.muted", null, t("sound")), soundBtn, h("div.small.muted", { style: { marginTop: "10px" } }, t("language")), langBtn),
      btn("🏅 " + t("achievements"), "gold block", () => { close(); openAchievements(); }, { style: "margin-top:12px" }),
      closeRow(close),
    ];
  });
}
const kv = (k, v) => h("div.kv", null, h("span.muted", null, k), n(short(v || 0)));

async function switchLang(l, close) {
  setLang(l); close();
  try { await act("lang", { lang: l }, { quiet: true }); } catch { /* local choice still applies */ }
  emit("lang");
}

export function openAchievements() {
  sheet((close) => {
    const m = S.me;
    const list = S.cfg.ACHIEVEMENTS.map((a) => {
      const p = m.ach.find((x) => x.id === a.id) ?? { progress: 0, claimed: false };
      const done = p.progress >= a.goal;
      return h("div.card" + (p.claimed ? ".locked" : done ? ".glow" : ""), null,
        h("div.row", null, h("div.ico.gold", null, a.icon),
          h("div.grow", null, h("b", null, nm(a)),
            h("div.progress.gold", null, h("i", { style: { width: Math.min(100, (p.progress / a.goal) * 100) + "%" } })),
            h("div.row.sb.tiny.muted", { style: { marginTop: "4px" } }, n(`${short(p.progress)} / ${short(a.goal)}`), h("span", null, costView(a.reward), a.xp ? ` +${a.xp} XP` : ""))),
          p.claimed ? h("span.pill.green", null, "✓") : btn(t("claim"), done ? "gold sm" : "ghost sm", async () => {
            await act("ach", { id: a.id }, { okSound: "coin" }); notify("success"); close(); openAchievements();
          }, done ? {} : { disabled: true })));
    });
    return [h("div.h1", null, "🏅 ", t("achievements")), list, closeRow(close)];
  }, { full: true });
}

const LOG = {
  attacked_lost: (d) => [`🚨 ${d.by} ${flagOf(d.country)}`, t("defeat") + " " + (d.loot ? "📦 " + Object.entries(d.loot).filter(([, v]) => v > 0).map(([k, v]) => `${RES_ICON[k]}${short(v)}`).join(" ") : "")],
  attacked_won: (d) => [`🛡 ${d.by} ${flagOf(d.country)}`, t("victory")],
  spy_caught: (d) => [`🕵️ ${d.by} ${flagOf(d.country)}`, t("spy_caught_you")],
  level: (d) => [`⭐ ${t("level_up")}`, `${t("level")} ${d.level}`],
};
export function openNotifications() {
  const m = S.me; if (!m) return;
  localStorage.setItem("wwx_seen", String(Date.now()));
  emit("me");
  sheet((close) => [
    h("div.h1", null, "🔔 ", t("notifications")),
    m.log?.length ? m.log.map((x) => { const f = LOG[x.k]; const [a, b] = f ? f(x.d || {}) : [x.k, ""]; return h("div.news", null, h("div.grow", null, h("b", null, a), h("div.small.muted", null, b)), h("span.t", null, ago(x.ts))); })
      : empty("📭", t("no_notif")),
    closeRow(close),
  ]);
}
