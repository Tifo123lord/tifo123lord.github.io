// @ts-check
/** Reactive app store. Server is authoritative; the client only projects resources between syncs for display. */

/** @typedef {{ cfg:any, me:any|null, world:any|null, syncedAt:number, serverSkew:number, tab:string }} StoreState */
/** @type {StoreState} */
export const S = { cfg: null, me: null, world: null, syncedAt: 0, serverSkew: 0, tab: "map" };
/** @type {Set<(k:string)=>void>} */
const subs = new Set();
/** @param {(k:string)=>void} fn */
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
/** @param {string} k */
export const emit = (k) => subs.forEach((f) => f(k));

/** Apply a fresh `me` view from any server response. */
export function setMe(me, serverNow = Date.now()) {
  if (!me) return;
  const prev = S.me;
  S.me = me; S.syncedAt = Date.now(); S.serverSkew = serverNow - Date.now();
  if (prev && me.level > prev.level) emit("levelup");
  emit("me");
}
export const serverNow = () => Date.now() + S.serverSkew;

/** Resources projected to now (display only), capped exactly like the server. @param {string} r */
export function liveRes(r) {
  const m = S.me; if (!m) return 0;
  const v = m.res[r], cap = m.caps[r];
  if (v >= cap) return v;
  return Math.min(cap, v + (m.rates[r] * (Date.now() - S.syncedAt)) / 3600_000);
}
/** @param {Record<string, number>} cost */
export function affordable(cost) { return Object.entries(cost || {}).every(([k, v]) => liveRes(k) >= v - 0.5); }
export const cfgById = (list, id) => S.cfg?.[list]?.find((x) => x.id === id);
export const countryOf = (id) => S.cfg?.COUNTRIES.find((c) => c.id === id);
