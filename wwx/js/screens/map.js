// @ts-check
import { S, subscribe } from "../core/store.js";
import { CENTROIDS, RES_ICON } from "../core/config.js";
import { t, num, short, nm, desc, dur, ago } from "../core/i18n.js";
import { api } from "../core/api.js";
import { tick } from "../core/tg.js";
import { sfx } from "../core/sound.js";
import { h, n, btn, sheet, closeRow, empty, live } from "../ui/dom.js";
import { flagOf, countryName, bonusText, errMsg } from "../ui/common.js";
import { openAttack, doSpy } from "../ui/battle.js";

let mapSvgText = "";
async function loadMap() { if (!mapSvgText) mapSvgText = await fetch("./map.svg?v=1").then((r) => r.text()); return mapSvgText; }

/** News item → one line. Names are bidi-isolated so mixed fa/en text stays in order. */
function newsLine(x) {
  const raw = x.data || {};
  const d = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" && !/^[A-Z]{2}$/.test(v) ? `\u2068${v}\u2069` : v]));
  switch (x.kind) {
    case "battle": return `${d.win ? "💥" : "🛡"} ${flagOf(d.ac)} ${d.a} ⚔️ ${flagOf(d.dc)} ${d.d}: ${d.win ? t("victory") : t("defeat")}${d.loot ? ` 📦${short(d.loot)}` : ""}${d.war ? " ⚔️" + t("war") : ""}`;
    case "spy_caught": return `🕵️ ${flagOf(d.ac)} ${d.a} → ${flagOf(d.dc)} ${d.d}: ${t("spy_fail").replace("!", "")}`;
    case "join": return `🆕 ${flagOf(d.country)} ${d.name}: ${countryName(d.country)}`;
    case "alliance_new": return `🏳️ [${d.tag}] ${d.name}: ${t("create_alliance")} (${d.by})`;
    case "alliance_join": return `🤝 ${flagOf(d.c)} ${d.name} → [${d.tag}] ${d.al}`;
    case "alliance_end": return `🏴 [${d.tag}] ${d.name}`;
    case "war": return `⚔️ [${d.at}] ${d.a} → [${d.bt}] ${d.b}: ${t("declare_war")}!`;
    case "nap": return `🕊 [${d.at}] ${d.a} 🤝 [${d.bt}] ${d.b}: ${t("nap")}`;
    case "nap_offer": return `📜 [${d.at}] ${d.a} → [${d.bt}] ${d.b}: ${t("propose_nap")}`;
    case "peace": return `🕊 [${d.at}] ${d.a} — [${d.bt}] ${d.b}: ${t("end_war")}`;
    default: return x.kind;
  }
}

/** @param {HTMLElement} root */
export async function mapScreen(root) {
  const evWrap = h("div"), tickerWrap = h("div"), mapBox = h("div.mapwrap"), layer = h("div.maplayer"), newsBox = h("div.card", null, h("div.empty", null, h("span.spin"))), targetsBox = h("div", null, h("div.empty", null, h("span.spin")));
  root.append(evWrap, mapBox, tickerWrap, h("div.h2", null, h("span", null, "🎯 ", t("targets")), btn("🔄", "ghost sm", () => refreshTargets())), targetsBox,
    h("div.h2", null, h("span", null, "📰 ", t("world_news")), h("span.pill.red", null, "● ", t("live"))), newsBox);
  mapBox.innerHTML = await loadMap();
  mapBox.append(layer);
  const svg = /** @type {SVGSVGElement} */ (mapBox.querySelector("svg"));
  svg.addEventListener("click", (e) => {
    const p = /** @type {Element} */ (e.target).closest?.(".pl"); if (!p) return;
    tick(); sfx.tap(); openCountry(/** @type {string} */ (p.getAttribute("data-c")));
  });

  const paintWorld = () => {
    const w = S.world; if (!w) return;
    const ev = w.event, nx = w.nextEvent;
    evWrap.replaceChildren(h("div.eventbar", null, h("div.ei", null, ev.icon),
      h("div.grow", null, h("div.tiny.muted", null, "🔥 ", t("world_event")), h("b", null, nm(ev)), h("div.small", null, desc(ev))),
      h("div", { style: { textAlign: "center" } }, h("div.tiny.muted", null, t("ends_in")), h("b.small", null, live(ev.ends, (s) => dur(s))),
        h("div.tiny.dim", null, t("next"), ": ", nx.icon))));
    const counts = Object.fromEntries((w.counts || []).map((c) => [c.country, c]));
    const maxP = Math.max(1, ...Object.values(counts).map((c) => Number(c.players)));
    layer.replaceChildren();
    for (const el of svg.querySelectorAll(".pl")) {
      const c = /** @type {string} */ (el.getAttribute("data-c")); const k = counts[c];
      el.classList.toggle("has", !!k); el.classList.toggle("hot", !!k && Number(k.players) >= Math.max(3, maxP * 0.7)); el.classList.toggle("mine", S.me?.country === c);
      const pos = CENTROIDS[c]; if (!pos) continue;
      const mk = h("div.mk" + (S.me?.country === c ? ".mine" : ""), { style: { left: pos[0] / 10 + "%", top: (pos[1] / 520) * 100 + "%" } }, flagOf(c), k ? h("span.n", null, short(Number(k.players))) : null);
      layer.append(mk);
      if (S.me?.country === c) layer.append(h("div.radar", { style: { left: pos[0] / 10 + "%", top: (pos[1] / 520) * 100 + "%" } }));
    }
    const items = (w.news || []).slice(0, 12).map(newsLine);
    tickerWrap.replaceChildren(h("div.ticker", null, h("span.live", null, t("live")), h("span.track", null, (items.length ? items : [t("no_news")]).map((s) => h("span", { dir: "auto" }, s)))));
    newsBox.replaceChildren(...((w.news || []).length ? w.news.slice(0, 25).map((x) => h("div.news", null, h("div.grow", null, newsLine(x)), h("span.t", null, ago(Date.parse(x.created_at))))) : [empty("🗞", t("no_news"))]));
  };

  const refreshTargets = async () => {
    try {
      const r = await api("targets");
      targetsBox.replaceChildren(...(r.rows.length ? r.rows.slice(0, 8).map(targetRow) : [h("div.card", null, empty("🌍", t("none_here")))]));
    } catch (e) { targetsBox.replaceChildren(h("div.card.small.muted", null, errMsg(e))); }
  };
  const refreshWorld = async () => { try { S.world = await api("world"); paintWorld(); } catch { /* keep last */ } };
  paintWorld(); refreshWorld(); refreshTargets();
  const iv = setInterval(() => { if (!root.isConnected) return clearInterval(iv); refreshWorld(); }, 20_000);
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "battle") { refreshWorld(); refreshTargets(); } });
}

/** One attackable commander. */
export function targetRow(x) {
  const now = Date.now(); const sh = x.shield_until > now; const me = S.me?.id === x.id;
  return h("div.li" + (me ? ".me" : ""), null,
    h("span.flag", null, flagOf(x.country)),
    h("div.grow", null, h("b.small.ellipsis", { style: { display: "block" } }, x.name),
      h("div.tiny.muted", null, "💪 ", n(short(x.power)), " · ⭐", n(x.level), sh ? h("span.pill", { style: { marginInlineStart: "6px" } }, "🛡 ", live(x.shield_until, (s) => dur(s))) : null, x.ally ? h("span.pill.green", { style: { marginInlineStart: "6px" } }, t("ally")) : null)),
    me ? h("span.pill.green", null, t("you")) : h("div.row", null,
      btn("🕵️", "primary sm", () => doSpy(x)),
      btn("⚔️", "danger sm", () => openAttack(x), sh || x.ally ? { disabled: true } : {})));
}

async function openCountry(c) {
  const cfg = S.cfg.COUNTRIES.find((x) => x.id === c);
  document.querySelectorAll("#worldsvg .sel").forEach((e) => e.classList.remove("sel"));
  document.querySelector(`#worldsvg [data-c="${c}"]`)?.classList.add("sel");
  sheet((close) => {
    const list = h("div", null, h("div.empty", null, h("span.spin")));
    api("targets", { country: c }).then((r) => list.replaceChildren(...(r.rows.length ? r.rows.map(targetRow) : [empty(cfg.flag, t("none_here"))]))).catch((e) => list.replaceChildren(h("div.muted", null, errMsg(e))));
    return [
      h("div.row", null, h("div.ico.gold", { style: { fontSize: "30px" } }, cfg.flag), h("div.grow", null, h("div.h1", { style: { margin: 0 } }, nm(cfg)), h("div.small.green", null, bonusText(cfg.bonus)))),
      h("div.h2", null, h("span", null, "🎖 ", t("players"))), list, closeRow(close),
    ];
  }, { onClose: () => document.querySelectorAll("#worldsvg .sel").forEach((e) => e.classList.remove("sel")) });
}
