// @ts-check
/** Client constants. The game rules themselves are served by the API (?config) — single source of truth. */
export const API_URL = "https://bilciuzlwsgylntymfpe.supabase.co/functions/v1/wwx-api";
export const BOT_URL = "https://t.me/WorldWarsX_Bot";
export const POLL_ME_MS = 30_000;
export const POLL_WORLD_MS = 20_000;
/** Map marker positions (SVG viewBox 1000×520), generated with tools/gen_map.mjs. */
export const CENTROIDS = {"CA":[267,115],"US":[247,171],"KZ":[666,141],"ID":[827,304],"AR":[330,409],"RU":[704,103],"ZA":[567,391],"MX":[223,220],"BR":[353,331],"FR":[506,147],"NG":[522,266],"IQ":[616,190],"VN":[792,244],"KR":[833,179],"IN":[716,224],"PK":[685,201],"IR":[644,192],"SE":[536,99],"UA":[577,139],"PL":[547,130],"DE":[525,133],"TR":[591,171],"ES":[491,167],"AU":[862,380],"CN":[769,179],"IT":[531,159],"GB":[493,124],"JP":[857,176],"SA":[621,219],"EG":[580,212]};
export const RES_KEYS = /** @type {const} */ (["money", "oil", "steel", "food", "pop"]);
export const RES_ICON = { money: "💰", oil: "🛢", steel: "⚙️", food: "🌾", pop: "👥" };
