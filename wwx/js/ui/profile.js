// @ts-check
import { S, emit } from "../core/store.js?v=3";
import { t, num, short, getLang, setLang, ago, dur, nm, desc } from "../core/i18n.js?v=3";
import { soundOn, setSound, sfx } from "../core/sound.js?v=3";
import { notify } from "../core/tg.js?v=3";
import { h, n, btn, sheet, closeRow, empty, live } from "./dom.js?v=3";
import { act, flagOf, countryName, bonusText, unitList, costView } from "./common.js?v=3";
import { icon, resIcon, entIcon } from "./icons.js?v=3";

export function commanderCard() {
  const m = S.me;
  const span = Math.max(1, m.xpNext - m.xpCur), pct = Math.min(100, ((m.xp - m.xpCur) / span) * 100);
  const si = m.seasonInfo;
  return h("div.herocard", null,
    h("div.hero-bg", { html: HERO_BG }),
    h("div.row.hero-top", null,
      h("div.hero-flag", null, flagOf(m.country), h("span.hero-lv", null, n(m.level))),
      h("div.grow", null,
        h("div.hero-rank.tiny", null, icon("chevrons"), t("commander"), " · ", countryName(m.country)),
        h("b.hero-name.ellipsis", null, m.name),
        h("div.hero-power", null, icon("power"), h("span.muted.small", null, t("power")), n(short(m.power), "gold")))),
    h("div.xpwrap", null,
      h("div.row.sb.tiny", null, h("span.icrow", null, icon("star"), t("level"), " ", n(m.level)), h("span.dim", null, "XP ", n(`${short(m.xp - m.xpCur)} / ${short(span)}`))),
      h("div.xpbar", null, h("i", { style: { width: pct + "%" } }))),
    h("div.row.sb.hero-season", null,
      h("div.small.icrow", null, icon("medal"), t("season"), " ", n(m.season.id), ": ", n(num(m.season.pts), "gold"), " ", t("season_pts")),
      h("div.tiny.muted.icrow", null, icon("clock"), live(si.end, (s) => dur(s)))));
}
/** Decorative skyline: radar dish, hangar, tower, flag and searchlights (pure SVG, no assets). */
const HERO_BG = `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
<linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#132a55"/><stop offset="1" stop-color="#0a1428"/></linearGradient>
<linearGradient id="hb-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7fd8ff" stop-opacity=".35"/><stop offset="1" stop-color="#7fd8ff" stop-opacity="0"/></linearGradient>
<linearGradient id="hb-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2944"/><stop offset="1" stop-color="#0b1222"/></linearGradient></defs>
<rect width="400" height="140" fill="url(#hb-sky)"/>
<path d="M300 140L250 0h22z" fill="url(#hb-beam)"/><path d="M330 140L390 10h18z" fill="url(#hb-beam)"/>
<g fill="#fff" opacity=".5"><circle cx="40" cy="20" r=".9"/><circle cx="120" cy="12" r=".7"/><circle cx="210" cy="30" r=".8"/><circle cx="360" cy="40" r=".7"/><circle cx="170" cy="8" r=".6"/></g>
<g fill="url(#hb-land)"><path d="M0 140V112l40-6 30 4 40-10 50 8 40-6 50 9 60-8 50 6 40-4v35z"/>
<path d="M232 112v-30h40v30z"/><path d="M226 84h52v-6h-52z"/><path d="M286 112v-14a24 24 0 0 1 48 0v14z"/><path d="M350 112V60h6v52z"/><path d="M346 62h14l-7-10z"/>
<path d="M190 112l8-30 8 30z"/><path d="M196 82c-8-4-12-12-10-20l18 10c-2 6-4 9-8 10z"/></g>
<path d="M353 52v-20" stroke="#4d6a9a" stroke-width="1.4"/><path d="M354 32l18 6-18 6z" fill="#ff4d63" opacity=".85"/>
<circle cx="353" cy="58" r="2" fill="#ff4d63"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
<g fill="#ffd25a" opacity=".7"><rect x="240" y="92" width="6" height="4"/><rect x="252" y="92" width="6" height="4"/><rect x="264" y="92" width="4" height="4"/></g></svg>`;
export function openProfile() {
  const m = S.me; if (!m) return;
  sheet((close) => {
    const cfgC = S.cfg.COUNTRIES.find((c) => c.id === m.country);
    const st = m.stats || {};
    const soundBtn = h("div.seg", null,
      h("button" + (soundOn() ? ".on" : ""), { onclick: () => { setSound(true); sfx.coin(); close(); openProfile(); } }, icon("sound"), t("on")),
      h("button" + (!soundOn() ? ".on" : ""), { onclick: () => { setSound(false); close(); openProfile(); } }, icon("mute"), t("off")));
    const langBtn = h("div.seg", null,
      h("button" + (getLang() === "fa" ? ".on" : ""), { onclick: () => switchLang("fa", close) }, "فارسی"),
      h("button" + (getLang() === "en" ? ".on" : ""), { onclick: () => switchLang("en", close) }, "English"));
    return [
      h("div.h1", null, icon("user"), t("profile")),
      commanderCard(),
      h("div.card", null,
        h("div.small.muted", null, t("start_bonus")), h("div.green.small", null, bonusText(cfgC?.bonus)),
        h("div.grid2", { style: { marginTop: "10px" } },
          kv("swords", t("wins"), st.wins), kv("skull", t("losses"), st.losses), kv("shield", t("def_wins"), st.defWins),
          kv("spy", t("spies"), st.spyOk), kv("box", t("looted"), st.looted), kv("fire", t("streak"), m.daily.streak))),
      m.seasons?.length ? h("div.card", null, h("div.small.muted.icrow", null, icon("trophy"), t("season")),
        m.seasons.map((s) => h("div.kv", null, h("span", null, t("season"), " ", n(s.id)), h("span", null, n(num(s.pts), "gold"), " · ", n(s.wins), " ", t("wins"))))) : null,
      h("div.h2", null, h("span.icrow", null, icon("gear"), t("settings"))),
      h("div.card", null, h("div.small.muted", null, t("sound")), soundBtn, h("div.small.muted", { style: { marginTop: "10px" } }, t("language")), langBtn),
      btn([icon("medal"), t("achievements")], "gold block", () => { close(); openAchievements(); }, { style: "margin-top:12px" }),
      closeRow(close),
    ];
  });
}
const kv = (ic, k, v) => h("div.kv", null, h("span.muted.icrow", null, icon(ic), k), n(short(v || 0)));

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
        h("div.row", null, h("div.ico.gold", null, entIcon({ icon: a.icon })),
          h("div.grow", null, h("b", null, nm(a)),
            h("div.progress.gold", null, h("i", { style: { width: Math.min(100, (p.progress / a.goal) * 100) + "%" } })),
            h("div.row.sb.tiny.muted", { style: { marginTop: "4px" } }, n(`${short(p.progress)} / ${short(a.goal)}`), h("span.row", { style: { gap: "6px" } }, costView(a.reward), a.xp ? h("span.xpchip", null, `+${a.xp} XP`) : ""))),
          p.claimed ? icon("check", "ic-lg") : btn(t("claim"), done ? "gold sm" : "ghost sm", async () => {
            await act("ach", { id: a.id }, { okSound: "coin" }); notify("success"); close(); openAchievements();
          }, done ? {} : { disabled: true })));
    });
    return [h("div.h1", null, icon("medal"), t("achievements")), list, closeRow(close)];
  }, { full: true });
}

const LOG = {
  attacked_lost: (d) => [[icon("siren"), " ", flagOf(d.country), " ", d.by], [t("defeat"), " ", d.loot ? costView(d.loot) : ""]],
  attacked_won: (d) => [[icon("shield"), " ", flagOf(d.country), " ", d.by], t("victory")],
  spy_caught: (d) => [[icon("spy"), " ", flagOf(d.country), " ", d.by], t("spy_caught_you")],
  level: (d) => [[icon("star"), " ", t("level_up")], `${t("level")} ${d.level}`],
};
export function openNotifications() {
  const m = S.me; if (!m) return;
  localStorage.setItem("wwx_seen", String(Date.now()));
  emit("me");
  sheet((close) => [
    h("div.h1", null, icon("bell"), t("notifications")),
    m.log?.length ? m.log.map((x) => { const f = LOG[x.k]; const [a, b] = f ? f(x.d || {}) : [x.k, ""]; return h("div.news", null, h("div.grow", null, h("b.icrow", null, a), h("div.small.muted", null, b)), h("span.t", null, ago(x.ts))); })
      : empty("inbox", t("no_notif")),
    closeRow(close),
  ]);
}
