// @ts-check
import { S, subscribe } from "../core/store.js?v=2";
import { CENTROIDS } from "../core/config.js?v=2";
import { t, num, short, nm, desc, dur, ago } from "../core/i18n.js?v=2";
import { api } from "../core/api.js?v=2";
import { tick } from "../core/tg.js?v=2";
import { sfx } from "../core/sound.js?v=2";
import { h, n, btn, sheet, closeRow, empty, live } from "../ui/dom.js?v=2";
import { flagOf, countryName, bonusText, errMsg } from "../ui/common.js?v=2";
import { openAttack, doSpy } from "../ui/battle.js?v=2";
import { icon, entIcon, flagImg } from "../ui/icons.js?v=2";

let mapSvgText = "";
async function loadMap() { if (!mapSvgText) mapSvgText = await fetch("./map.svg?v=2").then((r) => r.text()); return mapSvgText; }

/** News item → one line of nodes (icons + bidi-isolated names) so mixed fa/en text stays in order. */
function newsLine(x) {
  const raw = x.data || {};
  const d = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" && !/^[A-Z]{2}$/.test(v) ? `\u2068${v}\u2069` : v]));
  const F = (c) => flagOf(c);
  const I = (k) => icon(k, "nl");
  switch (x.kind) {
    case "battle": return [I(d.win ? "boom" : "shield"), F(d.ac), " ", d.a, " ", I("swords"), " ", F(d.dc), " ", d.d, ": ", h("b" + (d.win ? ".gold" : ".red"), null, d.win ? t("victory") : t("defeat")), d.loot ? [" ", I("box"), short(d.loot)] : "", d.war ? [" ", I("swords"), t("war")] : ""];
    case "spy_caught": return [I("spy"), F(d.ac), " ", d.a, " → ", F(d.dc), " ", d.d, ": ", t("spy_fail").replace("!", "")];
    case "join": return [I("sparkle"), F(d.country), " ", d.name, ": ", countryName(d.country)];
    case "alliance_new": return [I("flag"), `[${d.tag}] ${d.name}: ${t("create_alliance")} (${d.by})`];
    case "alliance_join": return [I("ally"), F(d.c), " ", `${d.name} → [${d.tag}] ${d.al}`];
    case "alliance_end": return [I("flag"), `[${d.tag}] ${d.name}`];
    case "war": return [I("swords"), `[${d.at}] ${d.a} → [${d.bt}] ${d.b}: `, h("b.red", null, t("declare_war") + "!")];
    case "nap": return [I("dove"), `[${d.at}] ${d.a} `, I("ally"), ` [${d.bt}] ${d.b}: ${t("nap")}`];
    case "nap_offer": return [I("scroll"), `[${d.at}] ${d.a} → [${d.bt}] ${d.b}: ${t("propose_nap")}`];
    case "peace": return [I("dove"), `[${d.at}] ${d.a} — [${d.bt}] ${d.b}: ${t("end_war")}`];
    default: return [x.kind];
  }
}

/** Gradients + glow filter for country fills, injected into the loaded map SVG. */
const MAP_DEFS = `<defs>
<linearGradient id="mg-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22324f"/><stop offset="1" stop-color="#161f33"/></linearGradient>
<linearGradient id="mg-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36507e"/><stop offset="1" stop-color="#22375c"/></linearGradient>
<linearGradient id="mg-has" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8cff"/><stop offset="1" stop-color="#1d4fa8"/></linearGradient>
<linearGradient id="mg-hot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5c70"/><stop offset="1" stop-color="#a3132f"/></linearGradient>
<linearGradient id="mg-mine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dffa6"/><stop offset="1" stop-color="#0d9d5c"/></linearGradient>
<linearGradient id="mg-sel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58f"/><stop offset="1" stop-color="#e59b1c"/></linearGradient>
<filter id="mg-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<pattern id="mg-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#3d6bb3" stroke-opacity=".12" stroke-width=".6"/></pattern>
</defs>`;

/** @param {HTMLElement} root */
export async function mapScreen(root) {
  const evWrap = h("div"), tickerWrap = h("div"), mapBox = h("div.mapwrap"), layer = h("div.maplayer"), newsBox = h("div.card", null, h("div.empty", null, h("span.spin"))), targetsBox = h("div", null, h("div.empty", null, h("span.spin")));
  const legend = h("div.maplegend", null, h("span.lg.mine", null, t("lg_mine")), h("span.lg.has", null, t("lg_active")), h("span.lg.hot", null, t("lg_hot")), h("span.lg.sel", null, t("lg_sel")));
  root.append(evWrap, mapBox, legend, tickerWrap, h("div.h2", null, h("span.icrow", null, icon("target"), t("targets")), btn(icon("refresh"), "ghost sm iconly", () => refreshTargets())), targetsBox,
    h("div.h2", null, h("span.icrow", null, icon("news"), t("world_news")), h("span.pill.red.livepill", null, h("i.ldot"), t("live"))), newsBox);
  mapBox.innerHTML = await loadMap();
  mapBox.append(layer, h("div.mapvignette"));
  const svg = /** @type {SVGSVGElement} */ (mapBox.querySelector("svg"));
  svg.insertAdjacentHTML("afterbegin", MAP_DEFS + '<rect x="0" y="0" width="1000" height="520" fill="url(#mg-grid)"/>');
  svg.addEventListener("click", (e) => {
    const p = /** @type {Element} */ (e.target).closest?.(".pl"); if (!p) return;
    tick(); sfx.tap(); openCountry(/** @type {string} */ (p.getAttribute("data-c")));
  });

  const paintWorld = () => {
    const w = S.world; if (!w) return;
    const ev = w.event, nx = w.nextEvent;
    evWrap.replaceChildren(h("div.eventbar", null, h("div.ei", null, entIcon(ev)),
      h("div.grow", null, h("div.tiny.evlabel.icrow", null, icon("fire"), t("world_event")), h("b", null, nm(ev)), h("div.small", null, desc(ev))),
      h("div.evtime", null, h("div.tiny.muted", null, t("ends_in")), h("b.small", null, live(ev.ends, (s) => dur(s))),
        h("div.tiny.dim.icrow", null, t("next"), ": ", entIcon(nx)))));
    const counts = Object.fromEntries((w.counts || []).map((c) => [c.country, c]));
    const maxP = Math.max(1, ...Object.values(counts).map((c) => Number(c.players)));
    layer.replaceChildren();
    for (const el of svg.querySelectorAll(".pl")) {
      const c = /** @type {string} */ (el.getAttribute("data-c")); const k = counts[c];
      el.classList.toggle("has", !!k); el.classList.toggle("hot", !!k && Number(k.players) >= Math.max(3, maxP * 0.7)); el.classList.toggle("mine", S.me?.country === c);
      const pos = CENTROIDS[c]; if (!pos) continue;
      const mk = h("div.mk" + (S.me?.country === c ? ".mine" : "") + (k ? ".on" : ""), { style: { left: pos[0] / 10 + "%", top: (pos[1] / 520) * 100 + "%" } }, flagOf(c), k ? h("span.n", null, short(Number(k.players))) : null);
      layer.append(mk);
      if (S.me?.country === c) layer.append(h("div.radar", { style: { left: pos[0] / 10 + "%", top: (pos[1] / 520) * 100 + "%" } }));
    }
    const items = (w.news || []).slice(0, 12).map(newsLine);
    tickerWrap.replaceChildren(h("div.ticker", null, h("span.live", null, t("live")), h("span.track", null, (items.length ? items : [[t("no_news")]]).map((s) => h("span.ti", { dir: "auto" }, s)))));
    newsBox.replaceChildren(...((w.news || []).length ? w.news.slice(0, 25).map((x) => h("div.news", null, h("div.grow", null, newsLine(x)), h("span.t", null, ago(Date.parse(x.created_at))))) : [empty("news", t("no_news"))]));
  };

  const refreshTargets = async () => {
    try {
      const r = await api("targets");
      targetsBox.replaceChildren(...(r.rows.length ? r.rows.slice(0, 8).map(targetRow) : [h("div.card", null, empty("globe", t("none_here")))]));
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
      h("div.tiny.muted.icrow", null, icon("power"), n(short(x.power)), h("span.sep"), icon("star"), n(x.level), sh ? h("span.pill.cyanp", null, icon("shield"), live(x.shield_until, (s) => dur(s))) : null, x.ally ? h("span.pill.green", null, icon("ally"), t("ally")) : null)),
    me ? h("span.pill.green", null, t("you")) : h("div.row", null,
      btn(icon("spy"), "primary sm iconly", () => doSpy(x), { "aria-label": t("spy") }),
      btn(icon("swords"), "danger sm iconly", () => openAttack(x), sh || x.ally ? { disabled: true, "aria-label": t("attack") } : { "aria-label": t("attack") })));
}

async function openCountry(c) {
  const cfg = S.cfg.COUNTRIES.find((x) => x.id === c);
  document.querySelectorAll("#worldsvg .sel").forEach((e) => e.classList.remove("sel"));
  document.querySelector(`#worldsvg [data-c="${c}"]`)?.classList.add("sel");
  sheet((close) => {
    const list = h("div", null, h("div.empty", null, h("span.spin")));
    api("targets", { country: c }).then((r) => list.replaceChildren(...(r.rows.length ? r.rows.map(targetRow) : [empty(flagImg(c, cfg.flag), t("none_here"))]))).catch((e) => list.replaceChildren(h("div.muted", null, errMsg(e))));
    return [
      h("div.row", null, h("div.ico.gold.flagico", null, flagImg(c, cfg.flag)), h("div.grow", null, h("div.h1", { style: { margin: 0 } }, nm(cfg)), h("div.small.green", null, bonusText(cfg.bonus)))),
      h("div.h2", null, h("span.icrow", null, icon("chevrons"), t("players"))), list, closeRow(close),
    ];
  }, { onClose: () => document.querySelectorAll("#worldsvg .sel").forEach((e) => e.classList.remove("sel")) });
}
