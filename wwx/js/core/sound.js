// @ts-check
/** Procedural sound effects with WebAudio — zero asset downloads. */
let ctx = /** @type {AudioContext|null} */ (null);
let enabled = localStorage.getItem("wwx_sound") !== "0";
export const soundOn = () => enabled;
/** @param {boolean} v */
export const setSound = (v) => { enabled = v; localStorage.setItem("wwx_sound", v ? "1" : "0"); };
function ac() {
  // Browsers only allow audio after a user gesture; skip silently until then.
  const ua = /** @type {any} */ (navigator).userActivation; if (ua && !ua.hasBeenActive) return null;
  if (!ctx) { const C = window.AudioContext || /** @type {any} */ (window).webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === "suspended") ctx.resume(); return ctx;
}
/** @param {number} f @param {number} d @param {OscillatorType} [type] @param {number} [vol] @param {number} [f2] @param {number} [delay] */
function tone(f, d, type = "sine", vol = 0.15, f2 = 0, delay = 0) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.05);
}
/** @param {number} d @param {number} vol @param {number} [lp] @param {number} [delay] */
function noise(d, vol = 0.3, lp = 1200, delay = 0) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay, len = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf; f.type = "lowpass"; f.frequency.value = lp; g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination); src.start(t);
}
export const sfx = {
  tap: () => enabled && tone(660, 0.05, "triangle", 0.06),
  tab: () => enabled && tone(520, 0.06, "sine", 0.07, 780),
  build: () => { if (!enabled) return; tone(220, 0.08, "square", 0.05); tone(330, 0.08, "square", 0.05, 0, 0.09); tone(440, 0.12, "triangle", 0.07, 0, 0.18); },
  train: () => { if (!enabled) return; noise(0.08, 0.15, 3000); tone(180, 0.1, "square", 0.05, 0, 0.05); noise(0.08, 0.15, 3000, 0.16); },
  coin: () => { if (!enabled) return; tone(988, 0.08, "square", 0.05); tone(1319, 0.18, "square", 0.05, 0, 0.08); },
  error: () => enabled && tone(200, 0.18, "sawtooth", 0.06, 120),
  launch: () => { if (!enabled) return; noise(1.1, 0.12, 900); tone(300, 1.0, "sawtooth", 0.04, 900); },
  boom: () => { if (!enabled) return; noise(0.9, 0.55, 500); tone(80, 0.6, "sine", 0.35, 30); },
  victory: () => { if (!enabled) return; [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.09, 0, i * 0.12)); tone(1047, 0.6, "sine", 0.06, 0, 0.5); },
  defeat: () => { if (!enabled) return; [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.05, 0, i * 0.16)); },
  alarm: () => { if (!enabled) return; for (let i = 0; i < 3; i++) tone(880, 0.16, "square", 0.05, 660, i * 0.22); },
  spy: () => { if (!enabled) return; tone(1200, 0.05, "sine", 0.05); tone(1500, 0.05, "sine", 0.05, 0, 0.08); tone(1800, 0.08, "sine", 0.05, 0, 0.16); },
  levelup: () => { if (!enabled) return; [440, 554, 659, 880, 1109].forEach((f, i) => tone(f, 0.18, "triangle", 0.08, 0, i * 0.08)); },
};
