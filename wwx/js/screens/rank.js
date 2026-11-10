// @ts-check
import { S, subscribe } from "../core/store.js?v=3";
import { t, num, short, dur } from "../core/i18n.js?v=3";
import { api } from "../core/api.js?v=3";
import { notify, confirmBox } from "../core/tg.js?v=3";
import { h, n, btn, sheet, closeRow, empty, live, toast } from "../ui/dom.js?v=3";
import { act, flagOf, errMsg, costView } from "../ui/common.js?v=3";
import { openAttack } from "../ui/battle.js?v=3";
import { icon } from "../ui/icons.js?v=3";

let kind = "power";
/** Rank badge: gold/silver/bronze medallions for the podium, a plain number after. */
const medal = (i) => (i < 3 ? h("span.podium.p" + (i + 1), null, String(i + 1)) : String(i + 1));

/** @param {HTMLElement} root */
export function rankScreen(root) {
  const list = h("div"), allyBox = h("div");
  const seg = h("div.seg");
  const paintSeg = () => seg.replaceChildren(...[["power", "power", t("rank_power")], ["season", "medal", t("rank_season")], ["alliances", "ally", t("rank_alliances")]].map(([k, ic, l]) =>
    h("button" + (kind === k ? ".on" : ""), { onclick: () => { kind = k; paintSeg(); load(); } }, icon(ic), l)));
  const load = async () => {
    list.replaceChildren(h("div.empty", null, h("span.spin")));
    try {
      const r = await api("top", { kind });
      if (kind === "alliances") {
        list.replaceChildren(...(r.rows.length ? r.rows.map((a, i) => h("div.li" + (a.id === S.me.alliance_id ? ".me" : ""), { onclick: () => openAlliance(a.id), style: { cursor: "pointer" } },
          h("span.rk", null, medal(i)), h("div.grow", null, h("b.small", null, `[${a.tag}] ${a.name}`), h("div.tiny.muted.icrow", null, icon("pop"), n(a.members), h("span.sep"), icon("power"), n(short(a.power)))), icon("chev")))
          : [h("div.card", null, empty("flag", t("no_alliance")))]));
        return;
      }
      const head = kind === "season" && r.season ? h("div.card", null, h("div.row.sb", null, h("b.icrow", null, icon("medal"), t("season"), " ", n(r.season.id)), h("span.small.muted", null, t("ends"), " ", live(r.season.end, (s) => dur(s))))) : null;
      const rows = r.rows.map((p, i) => h("div.li" + (p.id === S.me.id ? ".me" : ""), null,
        h("span.rk", null, medal(i)), h("span.flag", null, flagOf(p.country)),
        h("div.grow", null, h("b.small.ellipsis", { style: { display: "block" } }, p.name), h("div.tiny.muted.icrow", null, icon("star"), n(p.level), h("span.sep"), kind === "season" ? [icon("medal"), n(num(p.season_pts))] : [icon("power"), n(short(p.power))])),
        p.id !== S.me.id ? btn(icon("swords"), "danger sm iconly", () => openAttack({ ...p, shield_until: p.shield_until ? Date.parse(p.shield_until) : 0 })) : h("span.pill.green", null, t("you"))));
      list.replaceChildren(...[head, r.rank ? h("div.card.glow", null, h("div.row.sb", null, h("b", null, t("your_rank")), h("b.gold.rankno", null, "#", n(num(r.rank))))) : null, ...(rows.length ? rows : [empty("trophy", "—")])].filter(Boolean));
    } catch (e) { list.replaceChildren(h("div.muted", null, errMsg(e))); }
  };
  const paintAlly = async () => {
    const m = S.me;
    if (!m.alliance_id) {
      allyBox.replaceChildren(h("div.card", null, h("div.row", null, h("div.ico.green", null, icon("ally")), h("div.grow", null, h("b", null, t("alliance")), h("div.tiny.muted", null, t("no_alliance"))),
        btn([icon("flag"), t("create_alliance")], "success sm", () => createAlliance()))));
      return;
    }
    try {
      const d = await api("alliance", { id: m.alliance_id });
      const wars = d.treaties.filter((x) => x.kind === "war").length, pend = d.treaties.filter((x) => x.status === "pending" && x.b === m.alliance_id).length;
      allyBox.replaceChildren(h("div.card.glow", { onclick: () => openAlliance(m.alliance_id), style: { cursor: "pointer" } }, h("div.row", null, h("div.ico.green", null, icon("flag")),
        h("div.grow", null, h("b", null, `[${d.alliance.tag}] ${d.alliance.name}`), h("div.tiny.muted.icrow", null, icon("pop"), n(d.members.length), h("span.sep"), icon("power"), n(short(d.power)))),
        wars ? h("span.pill.red", null, icon("swords"), n(wars)) : null, pend ? h("span.pill.gold", null, icon("scroll"), n(pend)) : null, icon("chev"))));
    } catch { allyBox.replaceChildren(); }
  };
  root.replaceChildren(h("div.h1", null, icon("trophy"), t("tab_rank")), allyBox, h("div", { style: { height: "10px" } }), seg, h("div", { style: { height: "10px" } }), list);
  paintSeg(); load(); paintAlly();
  const un = subscribe((k) => { if (!root.isConnected) return un(); if (k === "ally") { paintAlly(); load(); } });
}

function createAlliance() {
  sheet((close) => {
    const name = h("input.field", { placeholder: t("alliance_name"), maxlength: 24 }), tag = h("input.field", { placeholder: t("alliance_tag"), maxlength: 5, style: { marginTop: "8px", textTransform: "uppercase" } });
    const dsc = h("input.field", { placeholder: t("alliance_desc"), maxlength: 140, style: { marginTop: "8px" } });
    return [h("div.h1", null, icon("flag"), t("create_alliance")), name, tag, dsc, h("div.small.muted", { style: { marginTop: "8px" } }, costView(S.cfg.RULES.allianceCost)),
      btn([icon("flag"), t("create_alliance")], "success block lg", async () => {
        await act("ally_create", { name: /** @type {any} */ (name).value, tag: /** @type {any} */ (tag).value, desc: /** @type {any} */ (dsc).value }, { okSound: "levelup" });
        notify("success"); close(); (await import("../core/store.js?v=3")).emit("ally");
      }, { style: "margin-top:12px" }), closeRow(close)];
  });
}

/** Alliance detail with members and diplomacy. */
export async function openAlliance(id) {
  let d; try { d = await api("alliance", { id }); } catch (e) { toast(errMsg(e), "err"); return; }
  const m = S.me, mine = m.alliance_id === id, owner = d.alliance.owner === m.id;
  const { emit } = await import("../core/store.js?v=3");
  sheet((close) => {
    const reopen = () => { close(); emit("ally"); openAlliance(id); };
    const treaties = d.treaties.map((x) => {
      const otherName = x.a === id ? `[${x.bTag}] ${x.bName}` : `[${x.aTag}] ${x.aName}`;
      const incoming = x.status === "pending" && x.b === id;
      return h("div.li", null, h("span.flag", null, icon(x.kind === "war" ? "swords" : "dove")),
        h("div.grow", null, h("b.small", null, otherName), h("div.tiny.muted", null, x.kind === "war" ? t("war") : t("nap"), " · ", x.status === "active" ? t("active") : t("pending"), " · ", live(Date.parse(x.expires_at), (s) => dur(s)))),
        mine && owner ? h("div.row", null,
          incoming ? btn(t("accept"), "success sm", async () => { await act("dip_respond", { id: x.id, accept: true }, { okSound: "coin" }); reopen(); }) : null,
          btn(x.kind === "war" && x.status === "active" ? t("end_war") : incoming ? t("reject") : t("cancel"), "ghost sm", async () => { await act("dip_respond", { id: x.id, accept: false }); reopen(); })) : null);
    });
    const members = d.members.map((p, i) => h("div.li" + (p.id === m.id ? ".me" : ""), null, h("span.rk", null, String(i + 1)), h("span.flag", null, flagOf(p.country)),
      h("div.grow", null, h("b.small.icrow", null, p.name, p.id === d.alliance.owner ? icon("crown") : ""), h("div.tiny.muted.icrow", null, icon("star"), n(p.level), h("span.sep"), icon("power"), n(short(p.power)))),
      owner && p.id !== m.id ? btn(t("kick"), "ghost sm", async () => { if (await confirmBox(`${t("kick")} ${p.name}?`)) { await act("ally_kick", { target: p.id }); reopen(); } })
        : !mine && p.id !== m.id ? btn(icon("swords"), "danger sm iconly", () => { close(); openAttack({ ...p, shield_until: p.shield_until ? Date.parse(p.shield_until) : 0 }); }) : null));
    const myOwnerElsewhere = !mine && m.alliance_id;
    return [
      h("div.row", null, h("div.ico.green", null, icon("flag")), h("div.grow", null, h("div.h1", { style: { margin: 0 } }, `[${d.alliance.tag}] ${d.alliance.name}`),
        h("div.small.muted", null, d.alliance.description || "—"))),
      h("div.grid2", { style: { marginTop: "10px" } }, h("div.card", null, h("div.tiny.muted", null, t("members")), h("b", null, n(d.members.length), " / ", n(S.cfg.RULES.allianceMax))), h("div.card", null, h("div.tiny.muted", null, t("power")), h("b.gold", null, n(short(d.power))))),
      h("div.h2", null, h("span.icrow", null, icon("globe"), t("diplomacy"))),
      h("div.tiny.muted.icrow.wrap", null, icon("swords"), t("war_hint"), h("span.sep"), icon("dove"), t("nap_hint")),
      treaties.length ? h("div", { style: { marginTop: "8px" } }, treaties) : h("div.small.dim", { style: { margin: "8px 0" } }, "—"),
      myOwnerElsewhere ? h("div.grid2", { style: { marginTop: "10px" } },
        btn([icon("dove"), t("propose_nap")], "primary", async () => { await act("dip_propose", { target: id, kind: "nap" }, { okSound: "coin" }); toast([icon("scroll"), " ", t("pending")], "ok"); reopen(); }),
        btn([icon("swords"), t("declare_war")], "danger", async () => { if (!(await confirmBox(`${t("declare_war")}: [${d.alliance.tag}] ${d.alliance.name}?`))) return; await act("dip_propose", { target: id, kind: "war" }, { okSound: "alarm" }); notify("warning"); reopen(); })) : null,
      h("div.h2", null, h("span.icrow", null, icon("pop"), t("members"))), members,
      !m.alliance_id ? btn([icon("ally"), t("join")], "success block lg", async () => { await act("ally_join", { id }, { okSound: "levelup" }); notify("success"); reopen(); }, { style: "margin-top:12px" }) : null,
      mine ? btn([icon("door"), t("leave")], "ghost block", async () => { if (await confirmBox(t("leave") + "?")) { await act("ally_leave"); close(); emit("ally"); } }, { style: "margin-top:12px" }) : null,
      closeRow(close),
    ];
  }, { full: true });
}
