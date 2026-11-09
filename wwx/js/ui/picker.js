// @ts-check
import { S } from "../core/store.js";
import { t, nm, getLang } from "../core/i18n.js";
import { tick, notify, mainButton } from "../core/tg.js";
import { sfx } from "../core/sound.js";
import { h, btn, toast } from "./dom.js";
import { act, bonusText } from "./common.js";

/** Country selection onboarding. Resolves when the player exists. @param {HTMLElement} root */
export function picker(root) {
  return new Promise((resolve) => {
    let chosen = "";
    const boxes = S.cfg.COUNTRIES.map((c) => {
      const el = h("button.cbox", { onclick: () => { chosen = c.id; tick(); sfx.tap(); boxes.forEach((b) => b.classList.toggle("on", b === el)); cta.textContent = `${c.flag} ${t("pick_cta")}`; cta.removeAttribute("disabled"); } },
        h("div.f", null, c.flag), h("div.n", null, nm(c)), h("div.b", null, bonusText(c.bonus)));
      return el;
    });
    const go = async () => {
      if (!chosen) return toast(t("pick_need"), "err");
      await act("start", { country: chosen, lang: getLang() }, { okSound: "victory" });
      notify("success"); mainButton(null); el.remove(); resolve(true);
    };
    const cta = btn(t("pick_need"), "success block lg", go, { disabled: true });
    const el = h("div.picker", null,
      h("div.hero", null, h("div", { style: { fontSize: "54px" } }, "🌍"), h("h1", null, "WORLD WAR ", h("b", null, "X")), h("div.muted", null, t("pick_sub"))),
      h("div.h1", null, "🏳️ ", t("pick_title")), h("div.cgrid", null, boxes), h("div.floatcta", null, cta));
    root.append(el);
  });
}
