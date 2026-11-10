// @ts-check
/** World War X — Mini App entry: boot, auth, shell, tabs, polling, deep links. */
import { fetchConfig, api, onConnectivity } from "./core/api.js?v=3";
import { S, setMe, subscribe, emit } from "./core/store.js?v=3";
import { initTelegram, inTelegram, haptic, tgUser } from "./core/tg.js?v=3";
import { t, setLang, getLang, errText } from "./core/i18n.js?v=3";
import { sfx } from "./core/sound.js?v=3";
import { BOT_URL, POLL_ME_MS } from "./core/config.js?v=3";
import { registerRouter } from "./core/router.js?v=3";
import { h, toast } from "./ui/dom.js?v=3";
import { icon } from "./ui/icons.js?v=3";
import { errMsg } from "./ui/common.js?v=3";
import { topbar } from "./ui/topbar.js?v=3";
import { picker } from "./ui/picker.js?v=3";
import { openBattleById } from "./ui/battle.js?v=3";
import { mapScreen } from "./screens/map.js?v=3";
import { baseScreen } from "./screens/base.js?v=3";
import { armyScreen } from "./screens/army.js?v=3";
import { researchScreen } from "./screens/research.js?v=3";
import { rankScreen } from "./screens/rank.js?v=3";

const app = /** @type {HTMLElement} */ (document.getElementById("app"));
const TABS = [
  ["map", "globe", "tab_map", mapScreen], ["base", "fort", "tab_base", baseScreen], ["army", "helmet", "tab_army", armyScreen],
  ["research", "flask", "tab_research", researchScreen], ["rank", "trophy", "tab_rank", rankScreen],
];

function landing(msg = "") {
  app.replaceChildren(h("div.picker", null, h("div.hero", { style: { paddingTop: "60px" } },
    h("div.boot-logo", { style: { margin: "0 auto" } }, icon("globe")), h("h1", null, "WORLD WAR ", h("b", null, "X")),
    h("p.muted", null, t("open_in_tg")), h("p.small.dim", null, msg || t("open_in_tg_sub")),
    h("a.btn.success.lg", { href: BOT_URL, style: { textDecoration: "none", marginTop: "12px" } }, icon("swords"), t("open_bot")))));
}

let screenEl = /** @type {HTMLElement|null} */ (null), tabbar = /** @type {HTMLElement|null} */ (null);
function shell() {
  app.replaceChildren();
  tabbar = h("nav.tabbar");
  app.append(topbar(), tabbar);
  paintTabs();
}
function paintTabs() {
  if (!tabbar) return;
  tabbar.replaceChildren(...TABS.map(([id, ic, label]) => h("button.tab" + (S.tab === id ? ".on" : ""), { onclick: () => go(id) }, h("span.ti", null, icon(/** @type {string} */ (ic))), h("span.tl", null, t(/** @type {any} */ (label))))));
}
/** @param {string} tab */
function go(tab) {
  const def = TABS.find((x) => x[0] === tab) ?? TABS[0];
  if (S.tab === def[0] && screenEl) { screenEl.scrollTo({ top: 0, behavior: "smooth" }); return; }
  S.tab = /** @type {string} */ (def[0]); haptic("light"); sfx.tab();
  screenEl?.remove();
  screenEl = h("main.screen.enter");
  app.insertBefore(screenEl, tabbar);
  /** @type {any} */ (def[3])(screenEl);
  paintTabs();
}
registerRouter((tab) => { if (S.tab !== tab) go(tab); });

/** Refresh `me`; also schedules a refresh exactly when the next queue item finishes. */
let nextTimer = 0;
async function syncMe() {
  try { const r = await api("me"); if (r.me) setMe(r.me, r.now); } catch { /* offline banner handles it */ }
}
subscribe((k) => {
  if (k !== "me" || !S.me) return;
  const ends = [...S.me.bq, ...S.me.rq, ...S.me.tq].map((q) => q.end).filter((e) => e > Date.now());
  clearTimeout(nextTimer);
  if (ends.length) nextTimer = setTimeout(async () => { await syncMe(); sfx.coin(); haptic("medium"); }, Math.min(...ends) - Date.now() + 1200);
});
subscribe((k) => { if (k === "levelup") { sfx.levelup(); haptic("heavy"); toast([icon("star"), ` ${t("level_up")} ${S.me.level}`], "ok"); } });
subscribe((k) => { if (k === "lang") { paintTabs(); const cur = S.tab; S.tab = ""; go(cur); } });

let offlineEl = /** @type {HTMLElement|null} */ (null);
onConnectivity((ok) => {
  if (ok) { offlineEl?.remove(); offlineEl = null; return; }
  if (!offlineEl) { offlineEl = h("div.offline", null, icon("signal"), " ", t("offline")); document.body.append(offlineEl); }
});

async function boot() {
  initTelegram();
  const u = tgUser();
  if (!localStorage.getItem("wwx_lang") && u?.language_code) setLang(u.language_code.startsWith("en") ? "en" : "fa");
  if (!inTelegram()) return landing();
  let me;
  try {
    const [cfg, r] = await Promise.all([fetchConfig(), api("me")]);
    S.cfg = cfg; me = r.me;
  } catch (e) { return landing(errMsg(e)); }
  if (!me) { app.replaceChildren(); await picker(app); }
  else { setMe(me); if (me.lang && me.lang !== getLang()) setLang(me.lang); }
  if (!S.me) await syncMe();
  shell();
  const q = new URLSearchParams(location.search);
  const want = q.get("go");
  go(want && TABS.some((x) => x[0] === want) ? want : "map");
  if (want === "battle" && q.get("id")) openBattleById(q.get("id"));
  setInterval(() => { if (document.visibilityState === "visible") syncMe(); }, POLL_ME_MS);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncMe(); });
  // Alert sound if we were attacked since last visit.
  const seen = Number(localStorage.getItem("wwx_seen") || 0);
  if (S.me.log?.some((x) => x.ts > seen && x.k.startsWith("attacked"))) { sfx.alarm(); haptic("heavy"); toast([icon("siren"), " ", t("notifications")], "err"); }
}
boot();
