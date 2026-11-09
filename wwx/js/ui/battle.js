// @ts-check
import { S, emit } from "../core/store.js";
import { CENTROIDS, RES_ICON } from "../core/config.js";
import { t, num, short, nm, dur, errText } from "../core/i18n.js";
import { haptic, notify, confirmBox } from "../core/tg.js";
import { sfx } from "../core/sound.js";
import { goTab } from "../core/router.js";
import { api } from "../core/api.js";
import { h, n, btn, sheet, closeRow, toast, empty } from "./dom.js";
import { act, flagOf, countryName, unitList, costView, errMsg } from "./common.js";

/** Estimated attack power of a selection (display only; the server simulates the real battle). */
function estPower(sel) { return Object.entries(sel).reduce((p, [u, c]) => p + c * (S.cfg.UNITS.find((x) => x.id === u)?.atk ?? 0), 0); }

/** Opens the attack planner for a target row ({id,name,country,power,level,shield_until}). */
export function openAttack(target) {
  const m = S.me; if (!m) return;
  const sel = {}; for (const u of S.cfg.UNITS) sel[u.id] = Math.floor(m.units[u.id] || 0);
  sheet((close) => {
    const est = h("b.num.gold");
    const upd = () => { est.textContent = short(estPower(sel)); };
    const intel = m && S.intelCache?.[target.id];
    const rows = S.cfg.UNITS.filter((u) => (m.units[u.id] || 0) > 0).map((u) => {
      const own = Math.floor(m.units[u.id]);
      const val = h("span.num", null, String(sel[u.id]));
      const sl = h("input.slider", { type: "range", min: 0, max: own, value: own, oninput: (e) => { sel[u.id] = Number(e.target.value); val.textContent = String(sel[u.id]); upd(); } });
      return h("div.li", null, h("div.ico", { style: { width: "38px", height: "38px", fontSize: "20px" } }, u.icon),
        h("div.grow", null, h("div.row.sb", null, h("b.small", null, nm(u)), h("span.small", null, val, " / ", n(own))), sl));
    });
    upd();
    return [
      h("div.h1", null, "⚔️ ", t("attack")),
      h("div.card", null, h("div.vs", null,
        h("div.side", null, h("div.f", null, flagOf(m.country)), h("b.small", null, t("you")), h("div.tiny.muted", null, t("power"), " ", n(short(m.power)))),
        h("div.x", null, "VS"),
        h("div.side", null, h("div.f", null, flagOf(target.country)), h("b.small.ellipsis", null, target.name), h("div.tiny.muted", null, t("power"), " ", n(target.power == null ? "?" : short(target.power)))))),
      target.power != null && target.power < m.power * 0.3 ? h("div.weak-chip", { style: { margin: "8px 0", display: "inline-block" } }, "⚠️ ", t("weak_target")) : null,
      h("div.h2", null, h("span", null, t("choose_army")), h("span.small", null, t("est_power"), ": ", est)),
      rows.length ? rows : empty("🪖", errText("no_units")),
      h("div.grid2", { style: { marginTop: "14px" } },
        btn("🕵️ " + t("spy"), "primary", async () => { close(); await doSpy(target); }),
        btn("🚀 " + t("send_attack"), "danger", async () => {
          const total = Object.values(sel).reduce((a, b) => a + b, 0);
          if (!total) { toast(errText("no_units"), "err"); return; }
          close(); await launch(target, { ...sel });
        }, rows.length ? {} : { disabled: true })),
      closeRow(close),
    ];
  });
}

/** Runs the attack: request + map animation in parallel, then the report. */
async function launch(target, sel) {
  goTab("map");
  sfx.launch(); haptic("heavy");
  const req = act("attack", { target: target.id, units: sel }, { quiet: true }).then((r) => ({ r }), (e) => ({ e }));
  await animateStrike(S.me.country, target.country, sel);
  const out = await req;
  if (out.e) { sfx.error(); notify("error"); toast(errMsg(out.e), "err"); return; }
  const rep = out.r.report;
  rep.win ? (sfx.victory(), notify("success"), confetti()) : (sfx.defeat(), notify("error"));
  showReport(rep);
  emit("battle");
}

/** Arcing projectiles from one country to another over the live map. */
export function animateStrike(fromC, toC, sel) {
  return new Promise((resolve) => {
    const svg = document.getElementById("worldsvg");
    const fx = document.getElementById("fx");
    if (!svg || !fx || !svg.getBoundingClientRect().width) { setTimeout(resolve, 600); return; }
    const r = svg.getBoundingClientRect(), k = r.width / 1000;
    const P = (c) => { const p = CENTROIDS[c] || [500, 260]; return [r.left + p[0] * k, r.top + p[1] * k]; };
    let [x1, y1] = P(fromC), [x2, y2] = P(toC);
    if (fromC === toC) { x1 -= 40; y1 += 25; }
    const icons = [];
    const has = (cat) => S.cfg.UNITS.some((u) => u.cat === cat && sel[u.id] > 0);
    if (has("missile")) icons.push("🚀"); if (has("air")) icons.push("✈️"); if (has("naval")) icons.push("🚢"); if (has("ground") || !icons.length) icons.push("💥");
    const NS = "http://www.w3.org/2000/svg";
    const ov = document.createElementNS(NS, "svg"); ov.setAttribute("width", "100%"); ov.setAttribute("height", "100%"); ov.style.position = "fixed"; ov.style.inset = "0";
    ov.innerHTML = `<defs><linearGradient id="trailgrad"><stop offset="0" stop-color="#ffd36b" stop-opacity="0"/><stop offset="1" stop-color="#ff4d2c"/></linearGradient></defs>`;
    fx.append(ov);
    const D = 1500, lift = Math.min(160, Math.hypot(x2 - x1, y2 - y1) * 0.45 + 40);
    const flights = icons.map((ic, i) => {
      const off = (i - (icons.length - 1) / 2) * 22;
      const cx = (x1 + x2) / 2 + off, cy = Math.min(y1, y2) - lift - i * 14;
      const path = document.createElementNS(NS, "path"); path.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`); path.setAttribute("class", "trail");
      ov.append(path); const L = path.getTotalLength(); path.style.strokeDasharray = `${L}`; path.style.strokeDashoffset = `${L}`;
      const el = h("div", { style: { position: "fixed", left: "0", top: "0", fontSize: "20px", filter: "drop-shadow(0 0 6px #ff6b2c)", willChange: "transform" } }, ic);
      fx.append(el); return { path, L, el, delay: i * 140 };
    });
    const ring = h("div.radar", { style: { position: "fixed", left: x2 + "px", top: y2 + "px", borderColor: "rgba(255,77,94,.9)" } }); fx.append(ring);
    const t0 = performance.now();
    const step = (now) => {
      let done = true;
      for (const f of flights) {
        const p = Math.min(1, Math.max(0, (now - t0 - f.delay) / D)); if (p < 1) done = false;
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const pt = f.path.getPointAtLength(e * f.L), pt2 = f.path.getPointAtLength(Math.min(f.L, e * f.L + 1));
        const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        f.path.style.strokeDashoffset = `${f.L * (1 - e)}`;
        f.el.style.transform = `translate(${pt.x - 10}px, ${pt.y - 12}px) rotate(${f.el.textContent === "🚀" ? ang + 45 : 0}deg)`;
        if (p >= 1 && !f.hit) { f.hit = true; f.el.remove(); explode(fx, x2 + (Math.random() - .5) * 24, y2 + (Math.random() - .5) * 18); }
      }
      if (!done) requestAnimationFrame(step);
      else {
        sfx.boom(); haptic("heavy");
        document.body.append(h("div.flash")); setTimeout(() => document.querySelector(".flash")?.remove(), 750);
        const app = document.getElementById("app"); app?.classList.add("shake"); setTimeout(() => app?.classList.remove("shake"), 520);
        for (let i = 0; i < 5; i++) setTimeout(() => explode(fx, x2 + (Math.random() - .5) * 46, y2 + (Math.random() - .5) * 30), i * 90);
        setTimeout(() => { ov.remove(); ring.remove(); resolve(); }, 650);
      }
    };
    requestAnimationFrame(step);
  });
}
function explode(fx, x, y) { const b = h("div.boom", { style: { position: "fixed", left: x + "px", top: y + "px" } }); fx.append(b); setTimeout(() => b.remove(), 820); }
function confetti() {
  const colors = ["#f6c453", "#2fd07f", "#3d8bff", "#ff4d5e", "#9b7bff"];
  for (let i = 0; i < 46; i++) {
    const c = h("div.confetti", { style: { left: Math.random() * 100 + "vw", background: colors[i % colors.length], animationDuration: 1.6 + Math.random() * 1.6 + "s", animationDelay: Math.random() * 0.4 + "s" } });
    document.body.append(c); setTimeout(() => c.remove(), 3800);
  }
}

/** Full battle report sheet. */
export function showReport(rep) {
  const meId = S.me?.id; const iAmAtt = rep.att.id === meId;
  const won = iAmAtt ? rep.win : !rep.win;
  sheet((close) => {
    const total = Math.max(1, rep.att.power + rep.def.power);
    const pa = h("i.a", { style: { width: "50%" } }), pd = h("i.d", { style: { width: "50%" } });
    setTimeout(() => { pa.style.width = (rep.att.power / total) * 100 + "%"; pd.style.width = (rep.def.power / total) * 100 + "%"; }, 80);
    const maxDmg = Math.max(1, ...rep.rounds.map((r) => Math.max(r.a, r.d)));
    const ids = S.cfg.UNITS.map((u) => u.id).filter((id) => (rep.att.sent[id] || rep.def.had[id]));
    const lootTotal = Object.values(rep.loot || {}).reduce((a, b) => a + b, 0);
    return [
      h("div.verdict", null, h("div.big." + (won ? "win" : "loss"), null, won ? "🏆 " + t("victory") : "💀 " + t("defeat")),
        rep.war ? h("div.pill.red", { style: { marginTop: "6px" } }, "⚔️ ", t("war_battle")) : null,
        rep.weak && iAmAtt ? h("div.weak-chip", { style: { marginTop: "6px", display: "inline-block" } }, t("weak_target")) : null),
      h("div.card", null,
        h("div.vs", null,
          h("div.side", null, h("div.f", null, flagOf(rep.att.country)), h("b.small", null, rep.att.name), h("div.tiny.muted", null, countryName(rep.att.country))),
          h("div.x", null, "⚔️"),
          h("div.side", null, h("div.f", null, flagOf(rep.def.country)), h("b.small", null, rep.def.name), h("div.tiny.muted", null, countryName(rep.def.country)))),
        h("div.pbar", null, pa, pd),
        h("div.row.sb.tiny", null, h("span.blue", null, "⚔️ ", n(short(rep.att.power))), h("span.red", null, "🛡 ", n(short(rep.def.power))))),
      h("div.h2", null, t("rounds")),
      h("div.card", null, rep.rounds.map((r, i) => h("div.round", { style: { animationDelay: i * 0.25 + "s" } },
        h("span.tiny.muted", null, t("round"), " ", n(i + 1)),
        h("div.rb", null, h("i", { style: { width: (r.a / maxDmg) * 100 + "%", background: "var(--g-primary)" } })),
        h("div.rb", null, h("i", { style: { width: (r.d / maxDmg) * 100 + "%", background: "var(--g-danger)" } })))),
        h("div.row.sb.tiny.dim", { style: { marginTop: "6px" } }, h("span", null, "🛡 ", t("garrison"), " ", n(short(rep.garrison.def))), h("span", null, "🎲 #", n(rep.seed % 100000)))),
      h("div.h2", null, t("units")),
      h("div.card", null, h("table.utable", null,
        h("tr", null, h("th", null, ""), h("th", null, flagOf(rep.att.country), " ", t("sent")), h("th", null, t("lost")), h("th", null, flagOf(rep.def.country), " ", t("had")), h("th", null, t("lost"))),
        ids.map((id) => { const u = S.cfg.UNITS.find((x) => x.id === id);
          return h("tr", null, h("td", null, u.icon, " ", nm(u)), h("td", null, n(num(rep.att.sent[id] || 0))), h("td.red", null, n(num(rep.att.lost[id] || 0))),
            h("td", null, n(num(rep.def.had[id] || 0))), h("td.red", null, n(num(rep.def.lost[id] || 0)))); }))),
      h("div.grid2", { style: { marginTop: "10px" } },
        h("div.card", null, h("div.small.muted", null, "📦 ", t("loot")), lootTotal ? costView(rep.loot) : h("div.dim", null, "—")),
        h("div.card", null, h("div.small.muted", null, "🏅 ", t("season_pts")), h("b.gold", null, "+", n(iAmAtt ? rep.pts : rep.defPts)))),
      iAmAtt ? h("div.grid2", { style: { marginTop: "12px" } },
        btn("🔁 " + t("attack"), "danger", () => { close(); openAttack({ id: rep.def.id, name: rep.def.name, country: rep.def.country, power: null }); }),
        btn(t("close"), "ghost", close))
        : h("div.grid2", { style: { marginTop: "12px" } }, btn("⚔️ " + t("attack"), "danger", () => { close(); openAttack({ id: rep.att.id, name: rep.att.name, country: rep.att.country, power: null }); }), btn(t("close"), "ghost", close)),
    ];
  }, { full: true });
}

/** Opens a stored battle by id (deep link #battle=ID). */
export async function openBattleById(id) {
  try { const r = await api("battles", { id: Number(id) }); if (r.rows?.[0]) showReport({ ...r.rows[0].report, id: r.rows[0].id }); } catch (e) { toast(errMsg(e), "err"); }
}

/** Spy mission with result sheet. */
export async function doSpy(target) {
  sfx.spy(); haptic("medium");
  let r;
  try { r = await act("spy", { target: target.id }); } catch { return; }
  S.intelCache = S.intelCache || {};
  if (r.success) { S.intelCache[target.id] = r.intel; notify("success"); sfx.coin(); showIntel(target, r.intel, r.chance); }
  else { notify("error"); sfx.alarm(); toast(`🚫 ${t("spy_fail")} (${t("chance")} ${r.chance}%)`, "err"); }
}
export function showIntel(target, i, chance) {
  sheet((close) => [
    h("div.h1", null, "🕵️ ", t("intel"), ": ", flagOf(i.country), " ", i.name),
    h("div.card.glow", null, h("div.row.sb", null, h("span.pill.green", null, "✓ ", t("spy_ok")), chance ? h("span.tiny.muted", null, t("chance"), " ", n(chance + "%")) : null),
      h("div.grid2", { style: { marginTop: "10px" } },
        Object.entries(i.res).map(([k, v]) => h("div.kv", null, h("span", null, RES_ICON[k], " ", t(/** @type {any} */ ("r_" + k))), n(short(v))))),
      h("div.kv", null, h("span.muted", null, "💪 ", t("power")), n(short(i.power))),
      h("div.kv", null, h("span.muted", null, "🛡 ", nm(S.cfg.BUILDINGS.find((b) => b.id === "bunker"))), n(i.buildings?.bunker ?? 0)),
      i.shield_until > Date.now() ? h("div.kv", null, h("span.muted", null, "🛡 ", t("shield_active")), n(dur((i.shield_until - Date.now()) / 1000))) : null),
    h("div.h2", null, t("units")),
    h("div.card", null, S.cfg.UNITS.map((u) => h("div.kv", null, h("span", null, u.icon, " ", nm(u)), n(num(i.units[u.id] || 0))))),
    i.research ? h("div.card", null, h("div.small.muted", null, "🔬 ", t("research")), h("div.small", null, S.cfg.TECHS.filter((x) => i.research[x.id] > 0).map((x) => `${x.icon}${i.research[x.id]}`).join("  ") || "—")) : null,
    h("div.grid2", { style: { marginTop: "12px" } }, btn("⚔️ " + t("attack"), "danger", () => { close(); openAttack({ ...target, power: i.power }); }), btn(t("close"), "ghost", close)),
  ]);
}
