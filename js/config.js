/* ==========================================================================
   INFINITY — config.js
   Single place for everything that is "settings" rather than "code".
   Change WEB_APP_URL after you deploy the Google Apps Script (see README).
   Everything here also has a safe fallback so the site never breaks if
   Google Sheets is unreachable.
   ========================================================================== */

const CONFIG = {
  // Paste the Web App URL you get after deploying api/google-apps-script.gs
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  WEB_APP_URL: "",

  // How long fetched data is cached in the browser (ms). Lowers Apps Script load.
  CACHE_TTL: 5 * 60 * 1000,

  CURRENCY_SYMBOL: "ج.م",

  // Used only until Settings sheet loads (or if it fails to load)
  DEFAULT_SETTINGS: {
    brand_name: "INFINITY",
    brand_name_ar: "انفنتي",
    logo: "",
    favicon: "",
    whatsapp: "201000000000",
    phone: "01000000000",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    address: "القاهرة، مصر",
    opening_hours: "يوميًا من 10 صباحًا حتى 12 منتصف الليل",
    hero_title: "لحظتك... بطعم لا يُنسى",
    hero_description: "مكسرات، شوكولاتة، كاندي وهدايا مختارة بعناية من انفنتي",
    hero_image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1200&q=80",
    about_title: "حكاية انفنتي",
    about_text: "بدأت انفنتي من فكرة بسيطة: كل لحظة تستحق طعمًا مميزًا. نختار أجود أنواع المكسرات والشوكولاتة والكاندي، ونغلفها بعناية لتصل إليك بجودة Premium حقيقية، سواء كانت لحظة لنفسك أو هدية لشخص تحبه.",
    about_image: "https://images.unsplash.com/photo-1599909533730-f4d0c937d956?w=900&q=80",
    stat_products: "100",
    stat_customers: "1000",
    stat_boxes: "50",
    free_shipping_limit: "500",
    currency: "EGP",
    footer_text: "انفنتي... عالم من المكسرات والشوكولاتة والكاندي والهدايا."
  }
};

// Live settings object the rest of the app reads from; populated by products.js
let SETTINGS = { ...CONFIG.DEFAULT_SETTINGS };

/** Format a number as EGP price text, e.g. 350 -> "350 ج.م" */
function formatPrice(value){
  const num = Number(value) || 0;
  return `${num.toLocaleString('ar-EG')} ${CONFIG.CURRENCY_SYMBOL}`;
}

/** Simple localStorage JSON helpers used across cart/favorites/etc. */
const Storage = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }
    catch(e){ /* storage full/unavailable: fail silently, don't break the page */ }
  }
};

/** Show a small toast message (used by cart/favorites/checkout) */
function showToast(message){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/** Read a URL query param, e.g. getParam('id') on product.html?id=001 */
function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}
