// @ts-check
/**
 * World War X icon set: one inline SVG sprite (symbols + shared gradients), injected once.
 * Every icon is a 24×24 symbol with gradient fills; unit art is a 120×48 side-view silhouette.
 * icon("money") → <svg class="ic ic-money"><use href="#i-money"/></svg>
 */
const NS = "http://www.w3.org/2000/svg";

/** Shared gradients (top-lit metal/enamel look). */
const G = {
  gold: ["#fff0b0", "#ffd25a", "#e0920f"], emerald: ["#a6ffd2", "#2fe08a", "#0b8f52"], crimson: ["#ffb0b8", "#ff4d63", "#b3122e"],
  cyan: ["#c4f7ff", "#45d4ff", "#0f7fc4"], steel: ["#ffffff", "#c3cfe2", "#6d7f9e"], violet: ["#e4d8ff", "#a083ff", "#5a33d6"],
  orange: ["#ffe2a3", "#ff9d2e", "#d4500f"], indigo: ["#b9a8ff", "#5a4bd6", "#1e1a5c"], dark: ["#6d7a96", "#3a4560", "#161c2c"],
  bronze: ["#ffdcb8", "#d88c4a", "#8a4a1c"], olive: ["#d6eea0", "#8fb44a", "#45651c"], navy: ["#9cc4ff", "#3d7bff", "#1b3aa6"],
  paper: ["#fff8e6", "#f0d9a6", "#b9935a"],
};
const grads = Object.entries(G).map(([k, [a, b, c]]) =>
  `<linearGradient id="wg-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`).join("")
  + `<linearGradient id="wg-art" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f1ff"/><stop offset=".5" stop-color="#9fb2d2"/><stop offset="1" stop-color="#4b5b7a"/></linearGradient>`
  + `<linearGradient id="wg-artdark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6b88"/><stop offset="1" stop-color="#1c2335"/></linearGradient>`
  + `<radialGradient id="wg-glass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e8fbff"/><stop offset=".5" stop-color="#4ccfff"/><stop offset="1" stop-color="#0b5fa0"/></radialGradient>`;

const f = (g) => `fill="url(#wg-${g})"`;
const HL = `fill="#fff" opacity=".35"`;
const DK = `fill="#0a1020" opacity=".55"`;
const st = (c, w = 2) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/** Gear outline path with a hole (evenodd). */
function gear(cx, cy, ro, ri, teeth, hole) {
  const pts = []; const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2; const r = i % 4 < 2 ? ro : ri;
    const a2 = a + (i % 4 === 1 || i % 4 === 3 ? 0 : 0);
    pts.push(`${(cx + r * Math.cos(a2)).toFixed(2)},${(cy + r * Math.sin(a2)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z M${cx + hole},${cy} a${hole},${hole} 0 1 0 ${-2 * hole},0 a${hole},${hole} 0 1 0 ${2 * hole},0Z`;
}
const STAR = "12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6";
const swordG = (rot) => `<g transform="rotate(${rot} 12 12)"><path d="M12 1.5l1.8 2.6V15h-3.6V4.1z" ${f("steel")}/><path d="M12 2.5V15" stroke="#fff" stroke-opacity=".6" stroke-width=".7"/><rect x="7.2" y="15" width="9.6" height="1.9" rx=".9" ${f("gold")}/><rect x="11" y="16.9" width="2" height="3.6" ${f("bronze")}/><circle cx="12" cy="21.4" r="1.3" ${f("gold")}/></g>`;

/** 24×24 symbols. */
const I = {
  // Resources
  money: `<circle cx="12" cy="12" r="10" ${f("gold")}/><circle cx="12" cy="12" r="7.4" fill="none" stroke="#8a4b00" stroke-opacity=".45" stroke-width="1.2"/><path d="M14.6 9.3c-.6-.9-1.6-1.4-2.7-1.4-1.5 0-2.6.8-2.6 1.9 0 2.6 5.5 1.4 5.5 4.3 0 1.2-1.2 2-2.8 2-1.2 0-2.3-.5-2.9-1.4M12 6.4v11.2" ${st("#7a3f00", 1.8)}/><path d="M6 8a7 7 0 0 1 6-4" ${st("#fff", 1.4)} opacity=".6"/>`,
  oil: `<path d="M12 1.8S4.6 10.2 4.6 15a7.4 7.4 0 0 0 14.8 0C19.4 10.2 12 1.8 12 1.8z" ${f("indigo")}/><path d="M12 1.8S4.6 10.2 4.6 15a7.4 7.4 0 0 0 14.8 0C19.4 10.2 12 1.8 12 1.8z" fill="none" stroke="#a99bff" stroke-width="1"/><path d="M8.2 14.6c0 2.2 1.3 3.7 3 4.2" ${st("#fff", 1.6)} opacity=".7"/>`,
  steel: `<path fill-rule="evenodd" d="${gear(12, 12, 10.5, 8, 9, 3.2)}" ${f("steel")}/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#4a5876" stroke-opacity=".5" stroke-width="1.3"/>`,
  food: `<path d="M12 22.5V7" ${st("#2fae6a", 1.8)}/>${[8, 11.2, 14.4, 17.6].map((y) => `<ellipse cx="9.3" cy="${y}" rx="1.9" ry="3.2" transform="rotate(-38 9.3 ${y})" ${f("gold")}/><ellipse cx="14.7" cy="${y}" rx="1.9" ry="3.2" transform="rotate(38 14.7 ${y})" ${f("gold")}/>`).join("")}<ellipse cx="12" cy="4.4" rx="1.8" ry="3" ${f("gold")}/>`,
  pop: `<circle cx="16.3" cy="7.8" r="3.1" ${f("navy")}/><path d="M10.6 20.5c0-3.6 2.6-6.2 5.7-6.2s5.7 2.6 5.7 6.2z" ${f("navy")}/><circle cx="9" cy="8.4" r="3.7" ${f("cyan")}/><path d="M1.8 21.5c0-4.3 3.2-7.3 7.2-7.3s7.2 3 7.2 7.3z" ${f("cyan")}/>`,
  // Navigation / UI
  globe: `<circle cx="12" cy="12" r="10" ${f("navy")}/><path d="M6.6 6.2c1.6-.5 3.1.3 3.5 1.6.4 1.2-.6 2-.1 3.1.6 1.1 2.2.8 2.6 2.1.4 1.5-.9 3.6-2.2 4.2-.9-1.3-.6-3-1.7-3.9-1.1-.9-2.8-.6-3.5-2-.6-1.2.3-2.5.2-3.6zM14 4.4c1.6.2 3.5 1.2 4.6 2.9-.9.4-2 .2-2.7.9-.6.7-.2 1.9-.9 2.4-.8.5-1.9-.3-2.2-1.2-.4-1.2.6-2.1.5-3.1 0-.6-.4-1.2.7-1.9zM16.7 13.8c1-.4 2.3.1 2.7 1-.6 1.6-1.8 3-3.3 3.8-.5-1.5-.2-3.9.6-4.8z" ${f("emerald")}/><circle cx="12" cy="12" r="10" fill="none" stroke="#9ad8ff" stroke-width="1.1"/><path d="M5 6.5A9 9 0 0 1 10 2.6" ${st("#fff", 1.3)} opacity=".55"/>`,
  fort: `<path d="M2 21.5V10h3V8h2v2h2V8h2v2h2V8h2v2h2V8h2v2h3v11.5z" ${f("steel")}/><path d="M2 13h20" stroke="#4a5876" stroke-opacity=".5"/><path d="M9.6 21.5v-3.8a2.4 2.4 0 0 1 4.8 0v3.8z" fill="#141b2c"/><path d="M12 8V1.6" ${st("#c3cfe2", 1.3)}/><path d="M12.3 1.8l5.2 1.7-5.2 1.7z" ${f("crimson")}/><rect x="4.2" y="14.5" width="2.2" height="2.6" rx=".5" ${f("gold")}/><rect x="17.6" y="14.5" width="2.2" height="2.6" rx=".5" ${f("gold")}/>`,
  helmet: `<path d="M3 15.2C3 9.9 7 6 12 6s9 3.9 9 9.2z" ${f("olive")}/><path d="M1.4 15h21.2v2.1c0 .6-.5 1.1-1.1 1.1h-19c-.6 0-1.1-.5-1.1-1.1z" fill="#3d561a"/><path d="M5 12.2h14" stroke="#2c3f12" stroke-opacity=".6" stroke-width="1.2"/><polygon points="12,8 12.9,9.8 14.8,10 13.4,11.2 13.8,13 12,12 10.2,13 10.6,11.2 9.2,10 11.1,9.8" ${f("gold")}/><path d="M6 10.5A7 7 0 0 1 10.5 7" ${st("#fff", 1.2)} opacity=".5"/>`,
  flask: `<path d="M10 2.8v6.4L4.6 18.4A2.4 2.4 0 0 0 6.7 22h10.6a2.4 2.4 0 0 0 2.1-3.6L14 9.2V2.8" fill="#1a2440" fill-opacity=".6" stroke="#cfe6ff" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.5 13.8h9l2.9 4.6c.6 1-.1 2.2-1.2 2.2H5.8c-1.1 0-1.8-1.2-1.2-2.2z" ${f("violet")}/><path d="M8.6 2.6h6.8" ${st("#cfe6ff", 1.8)}/><circle cx="10.4" cy="17.4" r="1.1" fill="#fff" opacity=".8"/><circle cx="13.6" cy="15.6" r=".7" fill="#fff" opacity=".7"/><circle cx="12.6" cy="11" r=".8" fill="#c8b6ff"/>`,
  trophy: `<path d="M7 5H4.3v1.6A3.6 3.6 0 0 0 8 10.2M17 5h2.7v1.6A3.6 3.6 0 0 1 16 10.2" ${st("#e9a91d", 1.8)}/><path d="M6.8 2.5h10.4V8a5.2 5.2 0 0 1-10.4 0z" ${f("gold")}/><rect x="10.6" y="13" width="2.8" height="3.4" ${f("bronze")}/><path d="M7 21.5c0-2.6 1.2-4.6 3-4.6h4c1.8 0 3 2 3 4.6z" ${f("bronze")}/><polygon points="12,4.3 12.9,6.2 15,6.4 13.4,7.7 13.9,9.7 12,8.6 10.1,9.7 10.6,7.7 9,6.4 11.1,6.2" fill="#fff" opacity=".75"/>`,
  bell: `<path d="M12 2.6a6.3 6.3 0 0 0-6.3 6.3v4.3L3.6 17h16.8l-2.1-3.8V8.9A6.3 6.3 0 0 0 12 2.6z" ${f("gold")}/><circle cx="12" cy="19.6" r="2.2" ${f("bronze")}/><path d="M8 8.5A4 4 0 0 1 11 5" ${st("#fff", 1.3)} opacity=".6"/>`,
  gift: `<rect x="4" y="11" width="16" height="10.5" rx="1.4" ${f("crimson")}/><rect x="2.8" y="7.3" width="18.4" height="4.2" rx="1.2" ${f("crimson")}/><rect x="10.7" y="7.3" width="2.6" height="14.2" ${f("gold")}/><path d="M12 7.3C10 3.6 6.3 3.4 6.3 5.5S10 7.3 12 7.3zM12 7.3c2-3.7 5.7-3.9 5.7-1.8S14 7.3 12 7.3z" ${f("gold")}/><rect x="2.8" y="7.3" width="18.4" height="1.4" ${HL}/>`,
  medal: `<path d="M6.5 1.8h4.2l2.4 6.6H8.9z" ${f("crimson")}/><path d="M17.5 1.8h-4.2l-2.4 6.6h4.2z" ${f("navy")}/><circle cx="12" cy="15" r="6.8" ${f("gold")}/><circle cx="12" cy="15" r="5" fill="none" stroke="#8a4b00" stroke-opacity=".4"/><polygon points="12,11.3 13.1,13.6 15.6,13.9 13.8,15.6 14.3,18.1 12,16.9 9.7,18.1 10.2,15.6 8.4,13.9 10.9,13.6" fill="#8a4b00" opacity=".55"/>`,
  fire: `<path d="M12 1.8c1 3.6 5.8 5.6 5.8 11.4a5.8 5.8 0 0 1-11.6 0c0-2.7 1.5-4.2 2.5-5.2.2 1.6 1 2.7 2.1 3.1C10.2 7.9 11 5 12 1.8z" ${f("orange")}/><path d="M12 12.4c.6 1.8 2.7 2.5 2.7 4.8a2.7 2.7 0 0 1-5.4 0c0-1.8 1.7-2.7 2.7-4.8z" fill="#fff3b0"/>`,
  chart: `<rect x="3" y="14" width="4" height="7.5" rx="1" ${f("emerald")}/><rect x="10" y="10" width="4" height="11.5" rx="1" ${f("emerald")}/><rect x="17" y="6.5" width="4" height="15" rx="1" ${f("emerald")}/><path d="M2.5 11.5l5.5-4.3 4 2.6L20 3.2" ${st("#ffd25a", 2)}/><path d="M16 3h4.2v4.2" ${st("#ffd25a", 2)}/>`,
  hammer: `<g transform="rotate(40 12 12)"><rect x="10.8" y="8" width="2.4" height="15" rx="1" ${f("bronze")}/><rect x="5.5" y="2.6" width="13" height="5.6" rx="1.2" ${f("steel")}/><rect x="5.5" y="2.6" width="13" height="1.6" rx=".8" ${HL}/></g>`,
  clock: `<circle cx="12" cy="12" r="10" ${f("steel")}/><circle cx="12" cy="12" r="7.8" fill="#16203a"/><path d="M12 7v5.2l3.6 2.1" ${st("#45d4ff", 2.1)}/><circle cx="12" cy="12" r="1.2" fill="#ffd25a"/>`,
  lock: `<path d="M7.8 10.5V8a4.2 4.2 0 0 1 8.4 0v2.5" ${st("#c3cfe2", 2.4)}/><rect x="4.8" y="10.2" width="14.4" height="11.4" rx="2.6" ${f("gold")}/><circle cx="12" cy="15" r="1.7" fill="#5a3400"/><path d="M12 15.5v3" ${st("#5a3400", 1.6)}/>`,
  up: `<path d="M12 2.2l8.6 8.6h-5V21.6H8.4V10.8h-5z" ${f("emerald")}/><path d="M12 2.2l8.6 8.6h-2.4L12 4.6z" ${HL}/>`,
  sword: swordG(40),
  swords: `${swordG(45)}${swordG(-45)}`,
  shield: `<path d="M12 1.8l8.6 3.2v6.3c0 5.5-3.6 9.6-8.6 11.3-5-1.7-8.6-5.8-8.6-11.3V5z" ${f("navy")}/><path d="M12 1.8v20.8c-5-1.7-8.6-5.8-8.6-11.3V5z" ${HL} opacity=".18"/><path d="M12 4.4l6.2 2.3v4.6c0 4-2.5 7.1-6.2 8.6" ${st("#bfe0ff", 1.2)} opacity=".7"/><polygon points="12,7.6 13.2,10 15.8,10.3 13.9,12.1 14.4,14.6 12,13.4 9.6,14.6 10.1,12.1 8.2,10.3 10.8,10" ${f("gold")}/>`,
  heart: `<path d="M12 21.3S3.3 15.9 3.3 10A4.9 4.9 0 0 1 12 7.2a4.9 4.9 0 0 1 8.7 2.8c0 5.9-8.7 11.3-8.7 11.3z" ${f("crimson")}/><path d="M6.3 9.2a2.5 2.5 0 0 1 2.4-1.9" ${st("#fff", 1.4)} opacity=".6"/>`,
  box: `<path d="M3 7.5L12 3l9 4.5v9.2L12 21.4l-9-4.7z" ${f("bronze")}/><path d="M3 7.5L12 3l9 4.5-9 4.6z" ${f("paper")}/><path d="M12 12.1v9.3" stroke="#5a2e0e" stroke-opacity=".5" stroke-width="1.2"/><path d="M7.5 5.3l9 4.5v3" ${st("#8a4a1c", 1.4)}/>`,
  spy: `<path d="M7 11.6L8.3 5.4c.2-.9 1.2-1.4 2-1l1.7.8 1.7-.8c.8-.4 1.8.1 2 1l1.3 6.2z" ${f("dark")}/><path d="M7.2 10h9.6l.4 1.5H6.8z" ${f("crimson")}/><path d="M3.6 12.6c2.6-.9 5.4-1.3 8.4-1.3s5.8.4 8.4 1.3c.6.2.5 1.1-.1 1.1H3.7c-.6 0-.7-.9-.1-1.1z" ${f("dark")}/><circle cx="8.4" cy="17.6" r="2.9" fill="url(#wg-glass)"/><circle cx="15.6" cy="17.6" r="2.9" fill="url(#wg-glass)"/><path d="M11.2 17.2c.5-.4 1.1-.4 1.6 0" ${st("#c3cfe2", 1.2)}/>`,
  refresh: `<path d="M19.6 10.5A7.8 7.8 0 0 0 5.6 6.4M4.4 13.5a7.8 7.8 0 0 0 14 4.1" ${st("#5fdcff", 2.4)}/><path d="M5 2.6v4.3h4.3M19 21.4v-4.3h-4.3" ${st("#5fdcff", 2.4)}/>`,
  target: `<circle cx="12" cy="12" r="10" ${f("crimson")}/><circle cx="12" cy="12" r="7" fill="#f4f6ff"/><circle cx="12" cy="12" r="4.2" ${f("crimson")}/><circle cx="12" cy="12" r="1.6" fill="#f4f6ff"/>`,
  news: `<path d="M17 8.5h4v10.6a2.2 2.2 0 0 1-4.4 0z" ${f("steel")}/><path d="M3 4.5h14.2v14.6a2.4 2.4 0 0 0 2.4 2.4H5.4A2.4 2.4 0 0 1 3 19.1z" ${f("paper")}/><rect x="5.4" y="7" width="9.4" height="3.6" rx=".6" ${f("crimson")}/><path d="M5.6 13.4h9.2M5.6 16.2h9.2M5.6 19h6" stroke="#6b4d22" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>`,
  skull: `<path d="M12 2.4a8.2 8.2 0 0 0-8.2 8.2c0 2.9 1.4 4.7 3.1 5.7V20h10.2v-3.7c1.7-1 3.1-2.8 3.1-5.7A8.2 8.2 0 0 0 12 2.4z" ${f("steel")}/><circle cx="8.6" cy="11.2" r="2.3" fill="#1a2132"/><circle cx="15.4" cy="11.2" r="2.3" fill="#1a2132"/><path d="M12 13.6l-1.2 2.2h2.4z" fill="#1a2132"/><path d="M9.6 20v-2.2M12 20v-2.2M14.4 20v-2.2" stroke="#1a2132" stroke-width="1.1"/>`,
  star: `<polygon points="${STAR}" ${f("gold")}/><polygon points="12,2 14.9,8.6 12,9.6" ${HL}/>`,
  crown: `<path d="M2.5 18.2L1.6 6.8l5.6 4.2L12 3.6l4.8 7.4 5.6-4.2-.9 11.4z" ${f("gold")}/><rect x="2.5" y="18.8" width="19" height="2.8" rx=".9" ${f("bronze")}/><circle cx="12" cy="13.6" r="1.6" ${f("crimson")}/><circle cx="7" cy="15" r="1.1" ${f("cyan")}/><circle cx="17" cy="15" r="1.1" ${f("cyan")}/>`,
  user: `<circle cx="12" cy="7.8" r="4.4" ${f("cyan")}/><path d="M3.5 21.6c0-4.8 3.8-8.2 8.5-8.2s8.5 3.4 8.5 8.2z" ${f("navy")}/>`,
  flag: `<path d="M5 2v20" ${st("#c3cfe2", 2)}/><path d="M6 3.4c3-1.6 5.6 1.5 8.6 0s4.5-.5 5.6 0v9.2c-1-.5-2.6-1.5-5.6 0s-5.6-1.6-8.6 0z" ${f("emerald")}/><path d="M6 3.4c3-1.6 5.6 1.5 8.6 0s4.5-.5 5.6 0v2c-1-.5-2.6-1.5-5.6 0S9 3.8 6 5.4z" ${HL}/>`,
  ally: `<rect x="1.8" y="7.2" width="12.4" height="9.6" rx="4.8" ${st("#ffd25a", 2.6)}/><rect x="9.8" y="7.2" width="12.4" height="9.6" rx="4.8" ${st("#45d4ff", 2.6)}/><path d="M14.2 9.6a4.8 4.8 0 0 0 0 4.8" ${st("#ffd25a", 2.6)}/>`,
  dove: `<path d="M2.6 12.8c3.6 0 5.6-1.6 7.1-4.5C11.3 5.1 14.3 3 17.8 3c-1.2 1.5-1.6 3.2-1.2 5l4.6 2-3.9 1c-1 5-5 8.1-11 8.1l2-3.1c-2.1 0-4.1-1-5.7-3.2z" ${f("steel")}/><path d="M18.6 6.4l3.4-.4-2.4 2" ${f("orange")}/><path d="M7 15.6c2.6.2 5.4-.9 7.2-3.4" ${st("#6d7f9e", 1.1)}/><path d="M20.4 9.8c1 .1 1.7.9 1.4 1.8-.9-.1-1.6-.8-1.4-1.8z" ${f("emerald")}/>`,
  scroll: `<rect x="4.6" y="2.6" width="14.8" height="18.8" rx="2.2" ${f("paper")}/><path d="M7.6 7h8.8M7.6 10h8.8M7.6 13h5.6" stroke="#6b4d22" stroke-opacity=".6" stroke-width="1.3" stroke-linecap="round"/><circle cx="15.4" cy="17" r="2.6" ${f("crimson")}/><path d="M14.2 19.2l-.6 3 1.8-1 1.8 1-.6-3" ${f("crimson")}/>`,
  plus: `<circle cx="12" cy="12" r="10" ${f("emerald")}/><path d="M12 7v10M7 12h10" ${st("#fff", 2.6)}/>`,
  check: `<circle cx="12" cy="12" r="10" ${f("emerald")}/><path d="M7.2 12.4l3.2 3.2 6.4-6.8" ${st("#fff", 2.6)}/>`,
  bolt: `<path d="M13.6 1.6L3.8 13.6h6.6l-1.2 8.8L20.2 9.4h-6.8z" ${f("gold")}/><path d="M13.6 1.6L3.8 13.6h3L13 5.4z" ${HL}/>`,
  power: `<path d="M12 1.6l9 5.2v10.4l-9 5.2-9-5.2V6.8z" ${f("orange")}/><path d="M12 1.6l9 5.2-9 5.2-9-5.2z" ${HL} opacity=".22"/><path d="M13 5.6l-5 7.4h3.6l-.8 5.4 5.4-7.6h-3.8z" fill="#fff"/>`,
  gear: `<path fill-rule="evenodd" d="${gear(12, 12, 10.3, 7.6, 8, 3.4)}" ${f("steel")}/>`,
  sound: `<path d="M3 9h4l5.4-4.6v15.2L7 15H3z" ${f("steel")}/><path d="M15.4 8.6a5 5 0 0 1 0 6.8M18.2 5.8a9 9 0 0 1 0 12.4" ${st("#45d4ff", 2)}/>`,
  mute: `<path d="M3 9h4l5.4-4.6v15.2L7 15H3z" ${f("steel")}/><path d="M15.5 9l6 6M21.5 9l-6 6" ${st("#ff4d63", 2.2)}/>`,
  door: `<rect x="4" y="2.4" width="11" height="19.2" rx="1.2" ${f("bronze")}/><circle cx="12.4" cy="12" r="1" fill="#ffe2a3"/><path d="M14 12h8M18.6 8.6L22 12l-3.4 3.4" ${st("#ff6a7c", 2.2)}/>`,
  chev: `<path d="M9 5l7 7-7 7" ${st("#8fa0c2", 2.4)}/>`,
  radar: `<circle cx="12" cy="12" r="10" fill="#08301e"/><circle cx="12" cy="12" r="10" fill="none" stroke="#2fe08a" stroke-width="1.4"/><circle cx="12" cy="12" r="6" fill="none" stroke="#2fe08a" stroke-opacity=".5"/><path d="M12 12L19 5A10 10 0 0 1 22 12z" fill="#2fe08a" opacity=".6"/><circle cx="16" cy="9" r="1.2" fill="#a6ffd2"/>`,
  dice: `<rect x="3" y="3" width="18" height="18" rx="4.4" ${f("steel")}/><circle cx="8" cy="8" r="1.6" fill="#1a2132"/><circle cx="16" cy="16" r="1.6" fill="#1a2132"/><circle cx="12" cy="12" r="1.6" fill="#ff4d63"/><circle cx="16" cy="8" r="1.6" fill="#1a2132"/><circle cx="8" cy="16" r="1.6" fill="#1a2132"/>`,
  warn: `<path d="M12 2.6l10.2 18.2H1.8z" stroke-linejoin="round" ${f("gold")}/><path d="M12 9v5.4" ${st("#4a2a00", 2.4)}/><circle cx="12" cy="17.6" r="1.4" fill="#4a2a00"/>`,
  signal: `<path d="M2.6 9.2a13.4 13.4 0 0 1 18.8 0M5.8 12.6a8.8 8.8 0 0 1 12.4 0M9 16a4.2 4.2 0 0 1 6 0" ${st("#ff6a7c", 2.2)}/><circle cx="12" cy="19.4" r="1.7" fill="#ff6a7c"/>`,
  calendar: `<rect x="3" y="4.4" width="18" height="17" rx="2.4" ${f("steel")}/><path d="M3 9V6.8a2.4 2.4 0 0 1 2.4-2.4h13.2A2.4 2.4 0 0 1 21 6.8V9z" ${f("crimson")}/><path d="M7.6 2.6v3.6M16.4 2.6v3.6" ${st("#3a4560", 2)}/><rect x="6.5" y="11.5" width="3" height="2.6" rx=".6" fill="#3a4560"/><rect x="10.5" y="11.5" width="3" height="2.6" rx=".6" fill="#3a4560"/><rect x="14.5" y="15.5" width="3" height="2.6" rx=".6" ${f("crimson")}/>`,
  gem: `<path d="M6 3.4h12l4 5.8-10 11.6L2 9.2z" ${f("cyan")}/><path d="M2 9.2h20M8.6 3.4L12 9.2l3.4-5.8M6.4 9.2l5.6 11.6 5.6-11.6" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none"/>`,
  inbox: `<path d="M2.6 13.4L5.4 4.6h13.2l2.8 8.8v6.2a2 2 0 0 1-2 2H4.6a2 2 0 0 1-2-2z" ${f("steel")}/><path d="M2.6 13.4h5.4l1.4 2.6h5.2l1.4-2.6h5.4" fill="none" stroke="#3a4560" stroke-width="1.4"/>`,
  sparkle: `<path d="M12 1.6l2.6 7.8 7.8 2.6-7.8 2.6L12 22.4l-2.6-7.8L1.6 12l7.8-2.6z" ${f("cyan")}/><circle cx="19" cy="5" r="1.6" fill="#ffd25a"/>`,
  boom: `<polygon points="12,1.4 14.2,7.4 20.4,4.6 17.2,10.2 22.6,12.6 16.6,14.2 18.4,20.6 12.8,16.8 9.4,22.4 8.6,16 2.2,17.4 6.4,12.4 1.6,8.4 7.8,8.6 7.2,2.4 10.8,7" ${f("orange")}/><polygon points="12,6.6 13.4,10.2 17,10.6 14.2,13 15,16.6 12,14.8 9,16.6 9.8,13 7,10.6 10.6,10.2" fill="#fff3b0"/>`,
  siren: `<path d="M5.4 17V11a6.6 6.6 0 0 1 13.2 0v6z" ${f("crimson")}/><rect x="3.4" y="17" width="17.2" height="4.4" rx="1.2" ${f("steel")}/><path d="M9 11a3 3 0 0 1 3-3" ${st("#fff", 1.6)} opacity=".8"/><path d="M12 1.4v2.2M3.4 5l1.6 1.6M20.6 5L19 6.6" ${st("#ffd25a", 1.8)}/>`,
  missile: `<g transform="rotate(45 12 12)"><path d="M12 1.2c1.9 1.6 2.7 3.8 2.7 6.3v9.4H9.3V7.5c0-2.5.8-4.7 2.7-6.3z" ${f("steel")}/><path d="M12 1.2c1.9 1.6 2.7 3.8 2.7 6.3H9.3c0-2.5.8-4.7 2.7-6.3z" ${f("crimson")}/><path d="M9.3 12.4L6.2 16.6v2.6l3.1-1.6zM14.7 12.4l3.1 4.2v2.6l-3.1-1.6z" ${f("crimson")}/><path d="M10.1 17.8h3.8L12 23z" ${f("orange")}/></g>`,
  jet: `<path d="M12 1.2c.9 0 1.5 1.2 1.5 3v4.4l7.8 5.4v2.4l-7.8-2.3v3.9l2.7 2v1.8L12 20.8l-4.2 1v-1.8l2.7-2V14l-7.8 2.3v-2.4l7.8-5.4V4.2c0-1.8.6-3 1.5-3z" ${f("steel")}/><ellipse cx="12" cy="6" rx=".9" ry="2" fill="url(#wg-glass)"/><path d="M12 1.2v19.6" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>`,
  bomber: `<path d="M12 1.6c.9 0 1.4 1 1.4 2.6V9l8.8 4.2v2.2l-8.8-1.9v4.7l3 2v1.6l-4.4-1-4.4 1v-1.6l3-2v-4.7l-8.8 1.9v-2.2L10.6 9V4.2c0-1.6.5-2.6 1.4-2.6z" ${f("olive")}/><rect x="5.6" y="11.6" width="1.6" height="3" rx=".6" fill="#2c3f12"/><rect x="16.8" y="11.6" width="1.6" height="3" rx=".6" fill="#2c3f12"/><ellipse cx="12" cy="4.6" rx=".8" ry="1.6" fill="url(#wg-glass)"/>`,
  ship: `<path d="M12 9V3.4" ${st("#c3cfe2", 1.4)}/><path d="M6.6 15v-3h3V9.2h4.8V12h3v3z" ${f("steel")}/><path d="M14.5 10.8h6" ${st("#c3cfe2", 1.4)}/><path d="M1.6 15h20.8l-3 5.2H4.6z" ${f("navy")}/><path d="M1.6 22.2c1.4 0 1.4-1 2.8-1s1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1" ${st("#45d4ff", 1.3)}/>`,
  sub: `<path d="M10 10.6V7.8h4.2l1.2 2.8z" ${f("steel")}/><path d="M12.6 7.8V4.6h1.8" ${st("#c3cfe2", 1.3)}/><path d="M2.6 14c0-2.1 2.2-3.6 5.4-3.6h9.2c2.8 0 4.6 1.5 4.6 3.6s-1.8 3.6-4.6 3.6H8c-3.2 0-5.4-1.5-5.4-3.6z" ${f("navy")}/><circle cx="17" cy="13.4" r=".9" fill="url(#wg-glass)"/><circle cx="14" cy="13.4" r=".9" fill="url(#wg-glass)"/><path d="M1.6 20.4c1.4 0 1.4-1 2.8-1s1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1" ${st("#45d4ff", 1.3)}/>`,
  tank: `<path d="M3.2 15.4h17.6a2.6 2.6 0 0 1 0 5.2H3.2a2.6 2.6 0 0 1 0-5.2z" fill="#262f44"/>${[4.4, 8.1, 11.8, 15.5, 19.2].map((x) => `<circle cx="${x}" cy="18" r="1.5" ${f("steel")}/>`).join("")}<path d="M3.6 15.4l1.6-3h13.4l1.6 3z" ${f("olive")}/><path d="M7.6 12.4c0-2 1.6-3.6 3.6-3.6h2.2c1.6 0 2.7 1 3 2.6l.2 1z" ${f("olive")}/><rect x="15" y="9.4" width="8" height="1.6" rx=".5" ${f("steel")}/>`,
  artillery: `<g transform="rotate(-28 12 13)"><rect x="6" y="10.6" width="17" height="2.4" rx=".8" ${f("steel")}/><rect x="4" y="9.4" width="6" height="4.8" rx="1" ${f("olive")}/></g><path d="M3 21.4l8.4-5.6 1.4 1.8-8.2 5.2z" ${f("olive")}/><circle cx="9.4" cy="17.6" r="4.2" fill="#262f44"/><circle cx="9.4" cy="17.6" r="1.6" ${f("steel")}/><circle cx="21" cy="3.6" r="1.6" ${f("orange")}/>`,
  // Buildings
  factory: `<path d="M2 21.6V11.6l5 3v-3l5 3v-3l5 3V4h3.6v17.6z" ${f("steel")}/><circle cx="18.8" cy="2.8" r="1.6" fill="#c3cfe2" opacity=".55"/><circle cx="16.6" cy="1.6" r="1" fill="#c3cfe2" opacity=".4"/>${[3.6, 8.6, 13.6].map((x) => `<rect x="${x}" y="16.4" width="2.6" height="2.4" rx=".4" ${f("gold")}/>`).join("")}<rect x="17.6" y="7" width="2.2" height="1.6" fill="#3a4560"/>`,
  refinery: `<path d="M15.2 21.6V6.4l2.2-3 2.2 3v15.2z" ${f("steel")}/><path d="M17.4 .6c1 1 1 2.1 0 3-.9-.9-.9-2 0-3z" ${f("orange")}/><path d="M15.2 10h4.4M15.2 14h4.4" stroke="#4a5876" stroke-width="1"/><rect x="2" y="11" width="7" height="10.6" rx="2" ${f("orange")}/><ellipse cx="5.5" cy="11.2" rx="3.5" ry="1.3" fill="#ffe2a3"/><rect x="9.6" y="14.6" width="5" height="7" rx="1.6" ${f("orange")}/><ellipse cx="12.1" cy="14.8" rx="2.5" ry="1" fill="#ffe2a3"/>`,
  mill: `<path d="M2.6 7h12.2c0 3 2.6 4.6 6.6 4.6v1.6c-3.2 0-5.4 1.4-5.4 4H8c0-2.6-1.6-4-3.6-4.4z" ${f("steel")}/><rect x="6.4" y="17.2" width="11" height="4.4" rx="1" ${f("dark")}/><path d="M2.6 7h12.2v1.6H3.2z" ${HL}/><circle cx="19" cy="4.6" r="1.2" ${f("orange")}/><circle cx="16.4" cy="3" r=".8" ${f("gold")}/><circle cx="21.4" cy="7.4" r=".7" ${f("orange")}/>`,
  barn: `<path d="M3 21.6V10.4l9-6.6 9 6.6v11.2z" ${f("crimson")}/><path d="M1.8 11L12 3.4 22.2 11" ${st("#ffe2e6", 1.6)}/><rect x="8.6" y="13.4" width="6.8" height="8.2" fill="#f4f6ff"/><path d="M8.6 13.4l6.8 8.2M15.4 13.4l-6.8 8.2" stroke="#b3122e" stroke-width="1.2"/><rect x="10.6" y="7.8" width="2.8" height="2.6" rx=".4" fill="#f4f6ff"/>`,
  tent: `<path d="M1.6 20.6L12 4l10.4 16.6z" ${f("olive")}/><path d="M12 4L1.6 20.6h4z" ${HL} opacity=".2"/><path d="M12 11.2l-4.4 9.4h8.8z" fill="#1d2a0c"/><path d="M12 4V1.2" ${st("#c3cfe2", 1.2)}/><path d="M12.2 1.2l3.4 1.1-3.4 1.1z" ${f("crimson")}/><rect x="1" y="20.4" width="22" height="1.6" rx=".8" fill="#3d561a"/>`,
  tower: `<path d="M7.4 5.4h9.2L15.4 10H8.6z" fill="url(#wg-glass)"/><path d="M6.6 4.2h10.8v1.6H6.6z" ${f("steel")}/><path d="M9.6 10h4.8l.8 10.4H8.8z" ${f("steel")}/><rect x="4" y="20.2" width="16" height="1.8" rx=".8" fill="#3a4560"/><path d="M12 4.2V1.4" ${st("#ff4d63", 1.4)}/><circle cx="12" cy="1.4" r="1" fill="#ff4d63"/>`,
  anchor: `<circle cx="12" cy="4.4" r="2.2" fill="none" stroke="#45d4ff" stroke-width="2"/><path d="M12 6.6v14.2M7.6 9.6h8.8M3.8 13.4c0 4.6 3.6 7.6 8.2 7.6s8.2-3 8.2-7.6" ${st("#45d4ff", 2.2)}/><path d="M1.8 14.8l2-3.4 2 3.4zM18.2 14.8l2-3.4 2 3.4z" fill="#45d4ff"/>`,
  bunker: `<path d="M2 20.2a10 9.2 0 0 1 20 0z" ${f("steel")}/><path d="M5 13.6a8 7 0 0 1 6-4.6" ${st("#fff", 1.4)} opacity=".5"/><rect x="7.4" y="14.6" width="9.2" height="2" rx="1" fill="#141b2c"/><rect x="1" y="20.2" width="22" height="2" rx="1" ${f("olive")}/>`,
  // Technologies
  derrick: `<path d="M12 2L6 21.6M12 2l6 19.6M8.4 13.6h7.2M7.4 17.4h9.2M9.6 8.6h4.8M9.6 8.6l6 8.8M14.4 8.6l-6 8.8" ${st("#ff9d2e", 1.5)}/><path d="M12 13.2s-2.4 2.8-2.4 4.4a2.4 2.4 0 0 0 4.8 0c0-1.6-2.4-4.4-2.4-4.4z" ${f("indigo")}/>`,
  nut: `<path fill-rule="evenodd" d="M12 1.8l8.8 5.1v10.2L12 22.2l-8.8-5.1V6.9zM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" ${f("steel")}/><path d="M12 1.8l8.8 5.1-2 1.2L12 4.2z" ${HL}/>`,
  sprout: `<path d="M12 22v-9" ${st("#2fae6a", 2)}/><path d="M12 13C12 7.6 8.2 5 3 5c0 5.2 3.4 8 9 8z" ${f("emerald")}/><path d="M12 11c0-4.6 3.2-7.6 9-7.6 0 5-3.6 7.6-9 7.6z" ${f("emerald")}/><path d="M5 22h14" ${st("#8a4a1c", 2.4)}/>`,
  chevrons: `<path d="M3.6 3.4L12 7.6l8.4-4.2v3.4L12 11 3.6 6.8z" ${f("gold")}/><path d="M3.6 9.4L12 13.6l8.4-4.2v3.4L12 17 3.6 12.8z" ${f("gold")}/><path d="M3.6 15.4L12 19.6l8.4-4.2v3.4L12 23l-8.4-4.2z" ${f("crimson")}/>`,
  satellite: `<g transform="rotate(-40 12 12)"><rect x="9" y="8" width="6" height="8" rx="1.2" ${f("steel")}/><rect x="1" y="9.4" width="7" height="5.2" rx=".6" ${f("navy")}/><rect x="16" y="9.4" width="7" height="5.2" rx=".6" ${f("navy")}/><path d="M3.3 9.4v5.2M5.6 9.4v5.2M18.3 9.4v5.2M20.6 9.4v5.2" stroke="#9cc4ff" stroke-width=".7"/></g><path d="M15.6 18.6a4.6 4.6 0 0 0 3-3" ${st("#45d4ff", 1.6)}/><path d="M16.4 21.6a7.6 7.6 0 0 0 5.2-5.2" ${st("#45d4ff", 1.6)} opacity=".6"/>`,
  compass: `<circle cx="12" cy="12" r="10" ${f("steel")}/><circle cx="12" cy="12" r="8" fill="#16203a"/><path d="M12 4.6l2.4 7.4H9.6z" ${f("crimson")}/><path d="M12 19.4l-2.4-7.4h4.8z" fill="#e9f1ff"/><circle cx="12" cy="12" r="1.3" ${f("gold")}/>`,
  wall: `${[[2, 4, 9], [11.4, 4, 10.6], [2, 9.4, 4.6], [7, 9.4, 9.8], [17.2, 9.4, 4.8], [2, 14.8, 9], [11.4, 14.8, 10.6]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="4.8" rx=".7" ${f("bronze")}/>`).join("")}<rect x="1" y="19.8" width="22" height="2" rx="1" fill="#3a4560"/>`,
  nuke: `<circle cx="12" cy="12" r="10" ${f("gold")}/><circle cx="12" cy="12" r="2" fill="#2a1a00"/>${[0, 120, 240].map((r) => `<path transform="rotate(${r} 12 12)" d="M12 9.6L9 4.4a8 8 0 0 1 6 0z" fill="#2a1a00"/>`).join("")}`,
  sack: `<path d="M9 5.6h6l-1.2-2.8c-.3-.7-1.2-1-1.8-.5-.6-.5-1.5-.2-1.8.5z" ${f("bronze")}/><path d="M9 6.4C4.8 9 3 13 3 16.4c0 3.4 2.6 5.4 9 5.4s9-2 9-5.4c0-3.4-1.8-7.4-6-10z" ${f("bronze")}/><path d="M8.6 6.2h6.8" ${st("#ffd25a", 1.8)}/><circle cx="12" cy="15" r="3.6" ${f("gold")}/><path d="M12 13v4" ${st("#7a3f00", 1.2)}/>`,
  castle: `<path d="M3 21.6V6.4h3.4v2.2h2V6.4h3.2v2.2h2V6.4H17v2.2h2V6.4h2v15.2z" ${f("steel")}/><path d="M9.6 21.6v-4.4a2.4 2.4 0 0 1 4.8 0v4.4z" fill="#141b2c"/><rect x="6" y="11.4" width="2" height="3" rx="1" fill="#141b2c"/><rect x="16" y="11.4" width="2" height="3" rx="1" fill="#141b2c"/>`,
  handshake: "",
};
I.handshake = I.ally;

/** Emoji → icon name, so any server-provided emoji gets a matching SVG. */
const EMOJI = {
  "💰": "money", "🛢": "oil", "⚙": "steel", "🌾": "food", "👥": "pop", "👶": "pop", "🏭": "factory", "🪖": "helmet", "🛫": "tower", "⚓": "anchor",
  "🔬": "flask", "🛡": "shield", "💥": "artillery", "✈": "jet", "🛩": "bomber", "🚢": "ship", "🌊": "sub", "🚀": "missile",
  "💹": "chart", "⛽": "derrick", "🔩": "nut", "🚜": "sprout", "📦": "box", "🎖": "chevrons", "🛰": "satellite", "🧭": "compass", "🧱": "wall",
  "☢": "nuke", "🕵": "spy", "🕶": "spy", "⚡": "bolt", "🏰": "castle", "⚔": "swords", "🏅": "medal", "🤝": "ally", "📅": "calendar", "📈": "chart",
  "💎": "gem", "🌍": "globe", "⭐": "star", "👑": "crown", "🏆": "trophy", "🎁": "gift", "🔥": "fire", "🔒": "lock", "🔔": "bell",
};
/** Stable id → icon (preferred over emoji). */
const BY_ID = {
  money: "money", oil: "oil", steel: "steel", food: "food", pop: "pop",
  factory: "factory", refinery: "refinery", steel_mill: "mill", farm: "barn", barracks: "tent", airbase: "tower", naval_port: "anchor", research_lab: "flask", bunker: "bunker",
  infantry: "helmet", tanks: "tank", artillery: "artillery", fighter: "jet", bomber: "bomber", warship: "ship", submarine: "sub", missile: "missile",
  industry: "chart", drilling: "derrick", metallurgy: "nut", agriculture: "sprout", logistics: "box", ground_tech: "chevrons", aero_tech: "satellite", naval_tech: "compass",
  fortification: "wall", missile_tech: "nuke", plunder: "sack", intelligence: "spy",
  oil_boom: "oil", harvest: "food", war_economy: "money", arms_race: "factory", blitz: "bolt", iron_rain: "steel", fortress: "castle", research_surge: "flask", baby_boom: "pop", shadow_war: "spy",
};

/** 120×48 side-view silhouettes for unit cards. */
const SOLDIER = `<path d="M8 2c3 0 5 2 5 4.6H3C3 4 5 2 8 2z"/><path d="M4.4 6.6h7v3.2h-7z"/><path d="M3.6 10h8.6l1.6 12.4H2.2z"/><path d="M2.6 22h4.2L6 38H2zM8.8 22H13l2.6 16h-3.8z"/><path d="M9 13.4l14-4.6.6 1.6-14 4.6z"/><path d="M11 12.4l6.4 1.2v2.2L11 15z"/>`;
const ART = {
  infantry: `<g fill="url(#wg-art)"><g transform="translate(62 6)">${SOLDIER}</g><g transform="translate(36 9) scale(.92)" opacity=".75">${SOLDIER}</g><g transform="translate(12 12) scale(.84)" opacity=".5">${SOLDIER}</g></g>`,
  tanks: `<path d="M8 30h100a6 6 0 0 1 0 12H8a6 6 0 0 1 0-12z" fill="url(#wg-artdark)"/>${[16, 30, 44, 58, 72, 86, 100].map((x) => `<circle cx="${x}" cy="36" r="4.4" fill="url(#wg-art)"/>`).join("")}<g fill="url(#wg-art)"><path d="M10 30l8-8h78l10 8z"/><path d="M38 22l6-10h28l8 5v5z"/><path d="M78 14h36v3.6H78z"/><path d="M111 12.6h5v6.4h-5z"/><path d="M50 12V9h8v3z"/></g><path d="M46 12V2" stroke="#9fb2d2" stroke-width="1"/>`,
  artillery: `<g fill="url(#wg-art)"><path d="M44 25L108 6l1.6 5L47 31z"/><path d="M36 21h22v12H36z"/><path d="M12 41l38-12 4 4-38 12z"/><path d="M50 15l10-2v18H50z" opacity=".85"/></g><circle cx="48" cy="37" r="9" fill="url(#wg-artdark)"/><circle cx="48" cy="37" r="3.2" fill="url(#wg-art)"/>`,
  fighter: `<g fill="url(#wg-art)"><path d="M6 26l12-2 12-2 34-2c14-1 28-1 40 2l12 2-12 3-34 2-40 1-14 0z"/><path d="M46 26h24L50 41H40z"/><path d="M10 25L5 7h8l12 15z"/><path d="M10 28h14l-10 6H6z"/></g><path d="M74 19c6-6 18-5 24 1z" fill="url(#wg-glass)"/><path d="M0 26.4l6-2v4.2z" fill="#ff9d2e"/>`,
  bomber: `<g fill="url(#wg-art)"><path d="M6 24c0-4 4-6 10-6h82c10 0 18 4 18 7s-6 5-16 5H16c-6 0-10-2-10-6z"/><path d="M8 20L4 4h10l12 14z"/><path d="M44 24h36L60 43H46z"/></g><path d="M50 31h14v5H50z" fill="url(#wg-artdark)"/><path d="M100 20c4 0 8 1 10 3h-10z" fill="url(#wg-glass)"/>`,
  warship: `<path d="M66 12V2" stroke="#9fb2d2" stroke-width="1.4"/><g fill="url(#wg-art)"><path d="M30 30v-8h14v8zM48 30V16h14v-4h8v4h6v14zM80 30v-6h14v6z"/><path d="M94 25.6h18v2.4H94zM12 25.6h18v2.4H12z"/></g><path d="M4 30h112l-8 12H14z" fill="url(#wg-artdark)"/><path d="M4 30h112l-1.4 2H5.4z" fill="#c9d6ec" opacity=".6"/><path d="M0 45c6 0 6-2 12-2s6 2 12 2 6-2 12-2 6 2 12 2 6-2 12-2 6 2 12 2 6-2 12-2 6 2 12 2 6-2 12-2 6 2 12 2" fill="none" stroke="#45d4ff" stroke-opacity=".6" stroke-width="1.4"/>`,
  submarine: `<g fill="url(#wg-art)"><path d="M6 30c0-6 10-9 24-9h66c12 0 20 4 20 9s-8 8-20 8H30c-14 0-24-3-24-8z"/><path d="M52 21l4-12h16l4 12z"/><path d="M4 24l6 6-6 6z"/></g><path d="M62 9V2h4" fill="none" stroke="#9fb2d2" stroke-width="1.4"/><rect x="0" y="27" width="120" height="21" fill="#0b4d7a" opacity=".45"/><path d="M0 27c6 0 6-1.6 12-1.6s6 1.6 12 1.6 6-1.6 12-1.6 6 1.6 12 1.6 6-1.6 12-1.6 6 1.6 12 1.6 6-1.6 12-1.6 6 1.6 12 1.6 6-1.6 12-1.6 6 1.6 12 1.6" fill="none" stroke="#45d4ff" stroke-opacity=".7" stroke-width="1.2"/>`,
  missile: `<g transform="rotate(-18 60 26)"><path d="M22 22h68c8 0 16 2 22 4-6 2-14 4-22 4H22z" fill="url(#wg-art)"/><path d="M98 22.4c5 .6 10 2 14 3.6-4 1.6-9 3-14 3.6z" fill="url(#wg-crimson)"/><path d="M26 22l-10-9h8l10 9zM26 30l-10 9h8l10-9z" fill="url(#wg-crimson)"/><path d="M22 23.6L8 26l14 2.4z" fill="#ff9d2e"/><path d="M18 24.6L2 26l16 1.4z" fill="#fff3b0"/></g><rect x="20" y="38" width="72" height="5" rx="2" fill="url(#wg-artdark)"/><circle cx="30" cy="44" r="3" fill="url(#wg-artdark)"/><circle cx="82" cy="44" r="3" fill="url(#wg-artdark)"/>`,
};

let injected = false;
function inject() {
  if (injected || typeof document === "undefined") return; injected = true;
  const syms = Object.entries(I).filter(([, v]) => v).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("")
    + Object.entries(ART).map(([k, v]) => `<symbol id="a-${k}" viewBox="0 0 120 48">${v}</symbol>`).join("");
  const box = document.createElement("div");
  box.innerHTML = `<svg xmlns="${NS}" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>${grads}</defs>${syms}</svg>`;
  document.body.prepend(/** @type {Node} */ (box.firstChild));
}

/** @param {string} name @param {string} [cls] @returns {SVGSVGElement} */
export function icon(name, cls = "") {
  inject();
  const s = /** @type {SVGSVGElement} */ (document.createElementNS(NS, "svg"));
  s.setAttribute("class", `ic ic-${name}${cls ? " " + cls : ""}`); s.setAttribute("aria-hidden", "true");
  const u = document.createElementNS(NS, "use"); u.setAttribute("href", `#i-${name}`); s.append(u);
  return s;
}
/** HTML string variant for innerHTML contexts. @param {string} name */
export const iconHTML = (name, cls = "") => (inject(), `<svg class="ic ic-${name} ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`);
/** @param {string} k resource key */
export const resIcon = (k) => icon(BY_ID[k] || "money", "res-ic");
/**
 * Icon for a config entity (building/unit/tech/event/achievement): by id, then by emoji, else the emoji itself.
 * @param {{id?:string, icon?:string}|null|undefined} o @param {string} [cls]
 */
export function entIcon(o, cls = "") {
  const name = (o?.id && BY_ID[o.id]) || emojiName(o?.icon);
  if (name) return icon(name, cls);
  const sp = document.createElement("span"); sp.className = "ic-emoji"; sp.textContent = o?.icon ?? "•"; return sp;
}
/** @param {string|undefined} e */
export function emojiName(e) { if (!e) return ""; const k = e.replace(/\uFE0F/g, ""); return EMOJI[k] || ""; }
/** Unit silhouette art. @param {string} id */
export function unitArt(id) {
  inject();
  const s = /** @type {SVGSVGElement} */ (document.createElementNS(NS, "svg"));
  s.setAttribute("class", "unit-art"); s.setAttribute("viewBox", "0 0 120 48"); s.setAttribute("aria-hidden", "true");
  const u = document.createElementNS(NS, "use"); u.setAttribute("href", `#a-${ART[id] ? id : "infantry"}`); s.append(u);
  return s;
}
/** Photo URL for a unit (realistic art, webp). @param {string} id */
export const unitPhotoUrl = (id) => `./img/units/${id}.webp?v=3`;
/**
 * Realistic unit photo as a cover image; falls back to the SVG silhouette if it fails to load.
 * Never mirrored in RTL. @param {string} id @param {string} [cls]
 */
export function unitPhoto(id, cls = "unit-photo") {
  const img = document.createElement("img");
  img.className = cls; img.alt = ""; img.loading = "lazy"; img.decoding = "async"; img.draggable = false;
  img.onerror = () => { const host = img.parentElement; host?.classList.remove("has-photo"); host?.classList.add("no-photo"); img.replaceWith(cls === "unit-photo" ? unitArt(id) : icon(BY_ID[id] || "helmet")); };
  img.src = unitPhotoUrl(id);
  return img;
}
/** Icon for an emoji/UI name, tolerant: accepts an icon name or an emoji. @param {string} x */
export const ico = (x, cls = "") => icon(I[x] ? x : emojiName(x) || "star", cls);

/** Country flag image (flagcdn, free) with emoji fallback. @param {string} code @param {string} [emoji] */
export function flagImg(code, emoji = "🏳️") {
  const w = document.createElement("span"); w.className = "flg";
  if (!code || !/^[A-Z]{2}$/.test(code)) { w.textContent = emoji; w.classList.add("emo"); return w; }
  const img = document.createElement("img");
  img.src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`; img.alt = code; img.loading = "lazy"; img.decoding = "async";
  img.onerror = () => { w.textContent = emoji; w.classList.add("emo"); };
  w.append(img); return w;
}
