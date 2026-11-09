// @ts-check
/** i18n: Persian (default, RTL) and English. */

/** @typedef {"fa"|"en"} Lang */
/** @type {Lang} */
let lang = /** @type {Lang} */ (localStorage.getItem("wwx_lang") || "fa");

const fa = {
  tab_map: "نقشه", tab_base: "پایگاه", tab_army: "ارتش", tab_research: "تحقیق", tab_rank: "رتبه",
  pick_title: "کشورت را انتخاب کن", pick_sub: "هر کشور یک امتیاز ویژه دارد. انتخاب نهایی است.", pick_cta: "اعلام استقلال", pick_need: "یک کشور انتخاب کن",
  world_event: "رویداد جهانی", ends_in: "پایان در", next: "بعدی", live: "زنده", world_news: "اخبار جهان", no_news: "هنوز خبری نیست. اولین تاریخ‌ساز باش!",
  players: "فرمانده", tap_country: "روی یک کشور بزن تا فرماندهانش را ببینی", targets: "اهداف پیشنهادی", find_targets: "یافتن هدف",
  attack: "حمله", spy: "جاسوسی", shielded: "سپر", ally: "متحد", you: "شما", power: "قدرت", level: "سطح", none_here: "اینجا هنوز فرماندهی نیست.",
  commander: "فرمانده", season: "فصل", season_pts: "امتیاز فصل", ends: "پایان", daily: "پاداش روزانه", claim: "دریافت", claimed: "دریافت شد", streak: "روز پیاپی",
  buildings: "ساختمان‌ها", upgrade: "ارتقا", build: "ساخت", building_now: "در حال ساخت", max: "حداکثر", requires: "نیازمند", per_hour: "در ساعت", queue_busy: "صف ساخت پر است",
  achievements: "دستاوردها", production: "تولید", capacity: "ظرفیت",
  units: "نیروها", train: "آموزش", training: "در حال آموزش", owned: "موجود", strong_vs: "قوی در برابر", atk: "حمله", def: "دفاع", hp: "جان", carry: "حمل", time_each: "زمان هر نفر",
  battles: "تاریخچه نبرد", no_battles: "هنوز نبردی نداشته‌ای.", report: "گزارش",
  research: "تحقیقات", branch_eco: "اقتصاد", branch_mil: "نظامی", branch_ops: "عملیات ویژه", lab_need: "آزمایشگاه سطح", researching: "در حال تحقیق",
  rank_power: "قدرت", rank_season: "فصل", rank_alliances: "اتحادها", your_rank: "رتبه شما",
  alliance: "اتحاد", my_alliance: "اتحاد من", create_alliance: "تأسیس اتحاد", join: "عضویت", leave: "خروج", members: "اعضا", kick: "اخراج", owner: "رهبر",
  alliance_name: "نام اتحاد", alliance_tag: "برچسب (۲ تا ۵ حرف)", alliance_desc: "شعار (اختیاری)", no_alliance: "عضو هیچ اتحادی نیستی.",
  diplomacy: "دیپلماسی", nap: "پیمان عدم تجاوز", war: "جنگ", propose_nap: "پیشنهاد صلح", declare_war: "اعلان جنگ", accept: "پذیرش", reject: "رد", cancel: "لغو", end_war: "پایان جنگ", pending: "در انتظار", active: "فعال",
  war_hint: "در جنگ: غنیمت +۲۰٪ و امتیاز فصل +۵۰٪", nap_hint: "پیمان: اعضا نمی‌توانند به هم حمله کنند",
  choose_army: "انتخاب نیروهای حمله", all: "همه", send_attack: "شروع حمله", enemy: "دشمن", est_power: "قدرت تخمینی", intel: "اطلاعات", no_intel: "اطلاعاتی نداری. اول جاسوس بفرست.",
  spy_cost: "هزینه جاسوسی", spy_caught_you: "یک جاسوس دشمن دستگیر شد", spy_ok: "ماموریت جاسوسی موفق بود!", spy_fail: "جاسوس ما دستگیر شد!", chance: "شانس",
  victory: "پیروزی!", defeat: "شکست!", rounds: "دورهای نبرد", round: "دور", your_losses: "تلفات شما", enemy_losses: "تلفات دشمن", loot: "غنیمت", sent: "اعزامی", lost: "تلفات", had: "موجود",
  garrison: "پادگان دفاعی", war_battle: "نبرد در جنگ رسمی", weak_target: "هدف ضعیف: غنیمت کم و بدون امتیاز",
  close: "بستن", ok: "باشه", back: "بازگشت", settings: "تنظیمات", sound: "صدا", language: "زبان", on: "روشن", off: "خاموش", profile: "پروفایل",
  wins: "پیروزی", losses: "شکست", def_wins: "دفاع موفق", spies: "جاسوسی", looted: "غارت", offline: "اتصال قطع است...",
  notifications: "رویدادها", no_notif: "رویداد تازه‌ای نیست.", level_up: "ارتقای فرمانده!", reward: "پاداش", shield_active: "سپر فعال",
  open_in_tg: "این بازی داخل تلگرام اجرا می‌شود", open_in_tg_sub: "برای بازی، ربات را در تلگرام باز کن و دکمه «🎮 بازی» را بزن.", open_bot: "باز کردن در تلگرام",
  bonus: "امتیاز", start_bonus: "امتیاز شروع", min: "دقیقه", now: "اکنون", ago: "پیش",
  n_prod_money: "پول", n_prod_oil: "نفت", n_prod_steel: "فولاد", n_prod_food: "غذا", n_prod_pop: "جمعیت", n_atk_ground: "حمله زمینی", n_atk_air: "حمله هوایی", n_atk_naval: "حمله دریایی",
  n_atk_missile: "قدرت موشک", n_def_all: "دفاع", n_build_speed: "سرعت ساخت", n_train_speed: "سرعت آموزش", n_research_speed: "سرعت تحقیق", n_intel: "جاسوسی", n_loot: "غنیمت",
  r_money: "پول", r_oil: "نفت", r_steel: "فولاد", r_food: "غذا", r_pop: "جمعیت",
};
/** @type {Record<keyof typeof fa, string>} */
const en = {
  tab_map: "Map", tab_base: "Base", tab_army: "Army", tab_research: "Research", tab_rank: "Ranking",
  pick_title: "Choose your nation", pick_sub: "Every nation has a unique bonus. This choice is final.", pick_cta: "Declare independence", pick_need: "Pick a nation",
  world_event: "World event", ends_in: "Ends in", next: "Next", live: "LIVE", world_news: "World news", no_news: "No news yet. Make history!",
  players: "commanders", tap_country: "Tap a country to see its commanders", targets: "Suggested targets", find_targets: "Find targets",
  attack: "Attack", spy: "Spy", shielded: "Shield", ally: "Ally", you: "You", power: "Power", level: "Level", none_here: "No commanders here yet.",
  commander: "Commander", season: "Season", season_pts: "Season points", ends: "Ends", daily: "Daily reward", claim: "Claim", claimed: "Claimed", streak: "day streak",
  buildings: "Buildings", upgrade: "Upgrade", build: "Build", building_now: "Building", max: "Max", requires: "Requires", per_hour: "per hour", queue_busy: "Build queue is busy",
  achievements: "Achievements", production: "Production", capacity: "Capacity",
  units: "Units", train: "Train", training: "Training", owned: "Owned", strong_vs: "Strong vs", atk: "ATK", def: "DEF", hp: "HP", carry: "Carry", time_each: "Time each",
  battles: "Battle history", no_battles: "No battles yet.", report: "Report",
  research: "Research", branch_eco: "Economy", branch_mil: "Military", branch_ops: "Special Ops", lab_need: "Lab level", researching: "Researching",
  rank_power: "Power", rank_season: "Season", rank_alliances: "Alliances", your_rank: "Your rank",
  alliance: "Alliance", my_alliance: "My alliance", create_alliance: "Found alliance", join: "Join", leave: "Leave", members: "Members", kick: "Kick", owner: "Leader",
  alliance_name: "Alliance name", alliance_tag: "Tag (2–5 chars)", alliance_desc: "Motto (optional)", no_alliance: "You are not in an alliance.",
  diplomacy: "Diplomacy", nap: "Non-aggression pact", war: "War", propose_nap: "Offer pact", declare_war: "Declare war", accept: "Accept", reject: "Reject", cancel: "Cancel", end_war: "End war", pending: "Pending", active: "Active",
  war_hint: "At war: +20% loot and +50% season points", nap_hint: "Pact: members cannot attack each other",
  choose_army: "Choose attack force", all: "All", send_attack: "Launch attack", enemy: "Enemy", est_power: "Est. power", intel: "Intel", no_intel: "No intel yet. Send a spy first.",
  spy_cost: "Spy cost", spy_caught_you: "We caught an enemy spy", spy_ok: "Spy mission succeeded!", spy_fail: "Our spy was captured!", chance: "Chance",
  victory: "VICTORY!", defeat: "DEFEAT!", rounds: "Battle rounds", round: "Round", your_losses: "Your losses", enemy_losses: "Enemy losses", loot: "Loot", sent: "Sent", lost: "Lost", had: "Had",
  garrison: "Garrison", war_battle: "Battle in an official war", weak_target: "Weak target: reduced loot, no points",
  close: "Close", ok: "OK", back: "Back", settings: "Settings", sound: "Sound", language: "Language", on: "On", off: "Off", profile: "Profile",
  wins: "Wins", losses: "Losses", def_wins: "Defenses", spies: "Spy ops", looted: "Looted", offline: "Connection lost...",
  notifications: "Events", no_notif: "Nothing new.", level_up: "Commander level up!", reward: "Reward", shield_active: "Shield active",
  open_in_tg: "This game runs inside Telegram", open_in_tg_sub: "Open the bot in Telegram and tap “🎮 بازی” to play.", open_bot: "Open in Telegram",
  bonus: "Bonus", start_bonus: "Starting bonus", min: "min", now: "now", ago: "ago",
  n_prod_money: "Money", n_prod_oil: "Oil", n_prod_steel: "Steel", n_prod_food: "Food", n_prod_pop: "Population", n_atk_ground: "Ground attack", n_atk_air: "Air attack", n_atk_naval: "Naval attack",
  n_atk_missile: "Missile power", n_def_all: "Defense", n_build_speed: "Build speed", n_train_speed: "Training speed", n_research_speed: "Research speed", n_intel: "Espionage", n_loot: "Loot",
  r_money: "Money", r_oil: "Oil", r_steel: "Steel", r_food: "Food", r_pop: "Population",
};

/** Server error codes → messages. */
const ERR = {
  fa: {
    not_enough_resources: "منابع کافی نیست", build_queue_full: "صف ساخت پر است", research_queue_full: "یک تحقیق در جریان است", train_queue_full: "صف آموزش پر است",
    requirements_not_met: "پیش‌نیاز برآورده نشده", lab_level_low: "سطح آزمایشگاه کافی نیست", max_level: "به حداکثر سطح رسیده", bad_count: "تعداد نامعتبر",
    target_shielded: "هدف زیر سپر دفاعی است", cooldown: "نیروها در حال تجدید قوا هستند", no_units: "نیرویی انتخاب نشده", not_enough_units: "این تعداد نیرو نداری",
    same_alliance: "نمی‌توانی به هم‌پیمان حمله کنی", treaty_nap: "پیمان عدم تجاوز فعال است", cannot_attack_self: "نمی‌توانی به خودت حمله کنی",
    already_claimed: "قبلاً دریافت شده", not_completed: "هنوز کامل نشده", rate_limited: "خیلی سریع! چند ثانیه صبر کن", busy_try_again: "سرور شلوغ است، دوباره بزن",
    name_taken: "این نام یا برچسب قبلاً گرفته شده", bad_name: "نام اتحاد ۳ تا ۲۴ حرف باشد", bad_tag: "برچسب ۲ تا ۵ حرف یا عدد باشد", already_in_alliance: "تو عضو یک اتحاد هستی",
    alliance_full: "اتحاد پر است", not_owner: "فقط رهبر اتحاد", not_in_alliance: "عضو اتحادی نیستی", treaty_exists: "از قبل پیمان یا جنگی وجود دارد", has_nap: "اول پیمان صلح را لغو کن",
    unauthorized: "احراز هویت ناموفق. بازی را از داخل ربات باز کن", session_expired: "نشست منقضی شده. بازی را دوباره باز کن", server_not_configured: "سرور هنوز پیکربندی نشده (توکن ربات)",
    network: "خطای اتصال", internal: "خطای سرور", target_not_found: "هدف پیدا نشد", already_started: "قبلاً شروع کرده‌ای", bad_country: "کشور نامعتبر",
  },
  en: {
    not_enough_resources: "Not enough resources", build_queue_full: "Build queue is busy", research_queue_full: "Research already in progress", train_queue_full: "Training queue is full",
    requirements_not_met: "Requirements not met", lab_level_low: "Research Lab level too low", max_level: "Max level reached", bad_count: "Invalid amount",
    target_shielded: "Target is shielded", cooldown: "Forces are regrouping", no_units: "No units selected", not_enough_units: "You don't have that many units",
    same_alliance: "You can't attack an ally", treaty_nap: "A non-aggression pact is active", cannot_attack_self: "You can't attack yourself",
    already_claimed: "Already claimed", not_completed: "Not completed yet", rate_limited: "Too fast! Wait a few seconds", busy_try_again: "Server busy, try again",
    name_taken: "That name or tag is taken", bad_name: "Name must be 3–24 characters", bad_tag: "Tag must be 2–5 letters or digits", already_in_alliance: "You are already in an alliance",
    alliance_full: "Alliance is full", not_owner: "Leader only", not_in_alliance: "You're not in an alliance", treaty_exists: "A treaty or war already exists", has_nap: "Cancel the pact first",
    unauthorized: "Authentication failed. Open the game from the bot", session_expired: "Session expired. Reopen the game", server_not_configured: "Server not configured yet (bot token)",
    network: "Connection error", internal: "Server error", target_not_found: "Target not found", already_started: "Already started", bad_country: "Invalid country",
  },
};

export const getLang = () => lang;
export const isRtl = () => lang === "fa";
/** @param {Lang} l */
export function setLang(l) {
  lang = l; localStorage.setItem("wwx_lang", l);
  document.documentElement.lang = l; document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
}
/** @param {keyof typeof fa} k */
export const t = (k) => (lang === "fa" ? fa : en)[k] ?? k;
/** @param {string} code */
export const errText = (code) => /** @type {any} */ (ERR[lang])[code] ?? `⚠️ ${code}`;
/** Localised name of a config entity (has fa/en). @param {{fa:string,en:string}} o */
export const nm = (o) => (lang === "fa" ? o.fa : o.en);
/** @param {{faDesc?:string,enDesc?:string}} o */
export const desc = (o) => (lang === "fa" ? o.faDesc : o.enDesc) ?? "";

const nfFa = new Intl.NumberFormat("fa-IR"), nfEn = new Intl.NumberFormat("en-US");
/** Full number. @param {number} n */
export const num = (n) => (lang === "fa" ? nfFa : nfEn).format(Math.floor(n || 0));
/** Compact number: 12.4K, 3.1M. @param {number} n */
export function short(n) {
  n = Math.floor(n || 0); const a = Math.abs(n);
  const f = (v, s) => (lang === "fa" ? nfFa : nfEn).format(Math.round(v * 10) / 10) + s;
  if (a >= 1e9) return f(n / 1e9, "B"); if (a >= 1e6) return f(n / 1e6, "M"); if (a >= 1e4) return f(n / 1e3, "K");
  return num(n);
}
/** Duration in seconds → clock style "02:05:09" / "05:09", or "2 روز 04:10" for days. @param {number} sec */
export function dur(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p2 = (v) => String(v).padStart(2, "0");
  const loc = (str) => (lang === "fa" ? str.replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]) : str);
  if (d) return loc(`${d}${lang === "fa" ? " روز " : "d "}${p2(h)}:${p2(m)}`);
  return loc(h ? `${h}:${p2(m)}:${p2(s)}` : `${p2(m)}:${p2(s)}`);
}
/** Short human duration for "ago" labels. @param {number} sec */
function agoUnit(sec) {
  const u = lang === "fa" ? { d: " روز", h: " ساعت", m: " دقیقه" } : { d: "d", h: "h", m: "m" };
  if (sec >= 86400) return num(sec / 86400) + u.d; if (sec >= 3600) return num(sec / 3600) + u.h; return num(Math.max(1, sec / 60)) + u.m;
}
/** Relative time ("5m ago"). @param {number} ms */
export function ago(ms) { const s = (Date.now() - ms) / 1000; if (s < 45) return t("now"); return `${agoUnit(s)} ${t("ago")}`; }
setLang(lang);
