// @ts-check
import { API_URL } from "./config.js";
import { initData } from "./tg.js";

/** Consistent client error: `code` mirrors the server's GameError codes. */
export class ApiError extends Error {
  /** @param {string} code @param {any} [data] @param {number} [status] */
  constructor(code, data = null, status = 0) { super(code); this.code = code; this.data = data; this.status = status; }
}

let onlineCb = /** @type {(ok:boolean)=>void} */ (() => {});
/** @param {(ok:boolean)=>void} cb */
export const onConnectivity = (cb) => { onlineCb = cb; };

/**
 * Calls a server action. Retries once on network failure / 409 conflict.
 * @param {string} action @param {Record<string, any>} [params] @returns {Promise<any>}
 */
export async function api(action, params = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    try {
      res = await fetch(API_URL, { method: "POST", headers: { "content-type": "application/json", "x-init-data": initData() }, body: JSON.stringify({ a: action, ...params }) });
    } catch {
      onlineCb(false);
      if (attempt === 0) { await new Promise((r) => setTimeout(r, 800)); continue; }
      throw new ApiError("network");
    }
    onlineCb(true);
    const j = await res.json().catch(() => ({ ok: false, error: { code: "internal" } }));
    if (j.ok) return j;
    if ((j.error?.code === "busy_try_again" || res.status === 409) && attempt === 0) continue;
    throw new ApiError(j.error?.code ?? "internal", j.error?.data, res.status);
  }
  throw new ApiError("network");
}

/** @returns {Promise<any>} public game config */
export async function fetchConfig() {
  const cached = sessionStorage.getItem("wwx_cfg");
  if (cached) { try { const c = JSON.parse(cached); if (Date.now() - c._t < 600_000) return c; } catch { /* refetch */ } }
  const r = await fetch(`${API_URL}?config`).then((x) => x.json());
  if (!r.ok) throw new ApiError("internal");
  const c = { ...r.config, _t: Date.now() };
  sessionStorage.setItem("wwx_cfg", JSON.stringify(c));
  return c;
}
