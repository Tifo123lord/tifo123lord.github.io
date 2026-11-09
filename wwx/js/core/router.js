// @ts-check
/** Minimal tab router. main.js registers the implementation. */
let impl = /** @type {(tab:string)=>void} */ (() => {});
/** @param {(tab:string)=>void} fn */
export const registerRouter = (fn) => { impl = fn; };
/** @param {string} tab */
export const goTab = (tab) => impl(tab);
