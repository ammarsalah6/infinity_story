/* ==========================================================================
   INFINITY — products.js
   The single data layer. Every page asks THIS file for products/categories/
   settings/reviews — nothing else talks to Google Sheets directly.

   If CONFIG.WEB_APP_URL is empty, or the request fails, we fall back to the
   DEMO_* data below so the site always renders instead of crashing.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* Demo data — used only until you connect Google Sheets, or as a safety  */
/* net if the Apps Script is unreachable. Replace via Google Sheets, not  */
/* by editing this array.                                                */
/* ---------------------------------------------------------------------- */
const DEMO_CATEGORIES = [
  { id:"nuts", name_ar:"المكسرات", description:"فستق، لوز، كاجو وأكثر", image:"https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80" },
  { id:"chocolate", name_ar:"الشوكولاتة", description:"دارك وميلك وهوايت شوكليت", image:"https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=80" },
  { id:"candy", name_ar:"الكاندي", description:"حلويات ملونة لكل الأذواق", image:"https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&q=80" },
  { id:"snacks", name_ar:"السناكس", description:"خفيف ولذيذ في أي وقت", image:"https://images.unsplash.com/photo-1599490659213-e0b93a4a7f5c?w=600&q=80" },
  { id:"sweets", name_ar:"الحلويات", description:"تشكيلة حلويات فاخرة", image:"https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80" },
  { id:"derivatives", name_ar:"مشتقات المكسرات", description:"زبدة فول سوداني وطحينة مكسرات", image:"https://images.unsplash.com/photo-1524350876685-274059332603?w=600&q=80" },
  { id:"gift-boxes", name_ar:"بوكسات الهدايا", description:"بوكسات جاهزة لكل مناسبة", image:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80" },
  { id:"best-sellers", name_ar:"الأكثر مبيعًا", description:"اختيارات عملاء انفنتي", image:"https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80" }
];

const DEMO_PRODUCTS = [
  { id:"001", name_ar:"فستق فاخر محمص", category:"nuts", subcategory:"فستق", description:"فستق فاخر محمص بعناية ومملح بشكل متوازن، يأتي طازجًا في عبوة محكمة الغلق تحافظ على قرمشته.", short_description:"فستق فاخر عالي الجودة", image:"https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=700&q=80", image2:"https://images.unsplash.com/photo-1608797178993-9e6ec1e1c1c0?w=700&q=80", price:350, old_price:400, unit:"جرام", weight:"500", available:true, stock:25, featured:true, best_seller:true, new_product:false, offer:true, rating:4.9, reviews:128, tags:"فستق,مكسرات,فاخر,هدايا" },
  { id:"002", name_ar:"كاجو ملكي محمص بالعسل", category:"nuts", subcategory:"كاجو", description:"حبات كاجو مختارة يدويًا، محمصة ومغطاة بطبقة رقيقة من العسل الطبيعي.", short_description:"كاجو محمص بالعسل", image:"https://images.unsplash.com/photo-1563412885-e335dc95c69a?w=700&q=80", price:420, old_price:null, unit:"جرام", weight:"500", available:true, stock:18, featured:true, best_seller:true, new_product:false, offer:false, rating:4.8, reviews:96, tags:"كاجو,مكسرات,عسل" },
  { id:"003", name_ar:"لوز محمص مملح", category:"nuts", subcategory:"لوز", description:"لوز فاخر محمص على البخار ومملح بخفة للحفاظ على نكهته الطبيعية.", short_description:"لوز محمص مملح", image:"https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=700&q=80", price:300, old_price:null, unit:"جرام", weight:"500", available:true, stock:40, featured:false, best_seller:false, new_product:true, offer:false, rating:4.7, reviews:54, tags:"لوز,مكسرات" },
  { id:"004", name_ar:"بندق محمص فاخر", category:"nuts", subcategory:"بندق", description:"بندق تركي فاخر محمص بحرفية للحصول على قوام مقرمش ونكهة غنية.", short_description:"بندق تركي فاخر", image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&q=80", price:380, old_price:430, unit:"جرام", weight:"500", available:true, stock:22, featured:false, best_seller:false, new_product:false, offer:true, rating:4.6, reviews:38, tags:"بندق,مكسرات" },
  { id:"005", name_ar:"عين جمل طازج", category:"nuts", subcategory:"عين جمل", description:"عين جمل طبيعي كامل، غني بالأوميغا 3، مقرمش وطازج.", short_description:"عين جمل طبيعي", image:"https://images.unsplash.com/photo-1508747703725-719777637510?w=700&q=80", price:340, old_price:null, unit:"جرام", weight:"500", available:false, stock:0, featured:false, best_seller:false, new_product:false, offer:false, rating:4.5, reviews:21, tags:"عين جمل,مكسرات" },
  { id:"006", name_ar:"شوكولاتة بالحليب بلجيكية", category:"chocolate", subcategory:"ميلك", description:"شوكولاتة بالحليب بلجيكية الأصل، ناعمة القوام وغنية بالطعم الكريمي.", short_description:"شوكولاتة بلجيكية ناعمة", image:"https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80", price:180, old_price:220, unit:"جرام", weight:"250", available:true, stock:60, featured:true, best_seller:true, new_product:false, offer:true, rating:4.9, reviews:210, tags:"شوكولاتة,حليب,هدايا" },
  { id:"007", name_ar:"شوكولاتة دارك 70%", category:"chocolate", subcategory:"دارك", description:"شوكولاتة داكنة بنسبة كاكاو 70%، اختيار مثالي لعشاق النكهة الغنية القوية.", short_description:"دارك تشوكليت 70%", image:"https://images.unsplash.com/photo-1548907040-4baa419a1949?w=700&q=80", price:190, old_price:null, unit:"جرام", weight:"250", available:true, stock:35, featured:true, best_seller:false, new_product:true, offer:false, rating:4.8, reviews:87, tags:"شوكولاتة,دارك" },
  { id:"008", name_ar:"شوكولاتة هوايت بالفستق", category:"chocolate", subcategory:"وايت", description:"شوكولاتة بيضاء فاخرة مطعّمة بقطع الفستق المحمص.", short_description:"وايت شوكليت بالفستق", image:"https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80", price:210, old_price:null, unit:"جرام", weight:"250", available:true, stock:28, featured:false, best_seller:false, new_product:false, offer:false, rating:4.6, reviews:44, tags:"شوكولاتة,وايت,فستق" },
  { id:"009", name_ar:"كاندي ملون مشكل", category:"candy", subcategory:"كاندي", description:"تشكيلة كاندي ملونة بنكهات فواكه متنوعة، مثالية للتجمعات والحفلات.", short_description:"كاندي مشكل بالفواكه", image:"https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=700&q=80", price:120, old_price:150, unit:"جرام", weight:"400", available:true, stock:70, featured:true, best_seller:true, new_product:false, offer:true, rating:4.7, reviews:132, tags:"كاندي,حلويات,أطفال" },
  { id:"010", name_ar:"مارشميلو فاخر", category:"candy", subcategory:"مارشميلو", description:"مارشميلو طري وناعم بألوان ونكهات متعددة، رائع في الحفلات والتجمعات.", short_description:"مارشميلو ناعم", image:"https://images.unsplash.com/photo-1621939514649-c8a15b6a9f7e?w=700&q=80", price:95, old_price:null, unit:"جرام", weight:"300", available:true, stock:50, featured:false, best_seller:false, new_product:true, offer:false, rating:4.4, reviews:29, tags:"مارشميلو,كاندي" },
  { id:"011", name_ar:"ميكس سناكس مالح", category:"snacks", subcategory:"سناكس", description:"خليط من المكسرات والبسكويت المالح المقرمش، مثالي للسهرات.", short_description:"سناكس مالح مشكل", image:"https://images.unsplash.com/photo-1599490659213-e0b93a4a7f5c?w=700&q=80", price:160, old_price:null, unit:"جرام", weight:"400", available:true, stock:33, featured:false, best_seller:true, new_product:false, offer:false, rating:4.5, reviews:41, tags:"سناكس,مالح" },
  { id:"012", name_ar:"زبدة الفول السوداني الطبيعية", category:"derivatives", subcategory:"زبدة مكسرات", description:"زبدة فول سوداني طبيعية 100% بدون إضافات، مثالية للفطار الصحي.", short_description:"زبدة فول سوداني طبيعية", image:"https://images.unsplash.com/photo-1524350876685-274059332603?w=700&q=80", price:150, old_price:null, unit:"جرام", weight:"350", available:true, stock:44, featured:false, best_seller:false, new_product:false, offer:false, rating:4.6, reviews:33, tags:"زبدة فول سوداني,مشتقات" },
  { id:"013", name_ar:"بوكس مكسرات فاخر", category:"gift-boxes", subcategory:"بوكس مكسرات", description:"بوكس هدية أنيق يحتوي على تشكيلة مختارة من أفخر أنواع المكسرات.", short_description:"بوكس هدية مكسرات", image:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&q=80", price:550, old_price:650, unit:"بوكس", weight:"1000", available:true, stock:15, featured:true, best_seller:true, new_product:false, offer:true, rating:5.0, reviews:64, tags:"بوكس,هدايا,مناسبات,عيد ميلاد,مناسبة خاصة" },
  { id:"014", name_ar:"بوكس شوكولاتة مميز", category:"gift-boxes", subcategory:"بوكس شوكولاتة", description:"بوكس أنيق يجمع أفضل أنواع الشوكولاتة البلجيكية والمحلية.", short_description:"بوكس هدية شوكولاتة", image:"https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=700&q=80", price:480, old_price:null, unit:"بوكس", weight:"800", available:true, stock:20, featured:true, best_seller:false, new_product:true, offer:false, rating:4.9, reviews:52, tags:"بوكس,شوكولاتة,هدايا,خطوبة,زفاف" },
  { id:"015", name_ar:"بوكس رمضان الفاخر", category:"gift-boxes", subcategory:"بوكس مناسبات", description:"بوكس هدية مخصص لأجواء رمضان، يجمع المكسرات والتمور الفاخرة والحلويات.", short_description:"بوكس هدايا رمضان", image:"https://images.unsplash.com/photo-1587314168485-3236d6710814?w=700&q=80", price:600, old_price:720, unit:"بوكس", weight:"1200", available:true, stock:12, featured:false, best_seller:false, new_product:true, offer:true, rating:4.9, reviews:19, tags:"بوكس,رمضان,العيد,هدايا,مناسبة خاصة" }
];

const DEMO_REVIEWS = [
  { id:"1", customer_name:"سارة أحمد", rating:5, comment:"جودة المنتجات فعلاً Premium، والتغليف تحفة. البوكس وصل هدية لصديقتي وفرحت جدًا.", image:"https://i.pravatar.cc/100?img=5", approved:true, date:"2026-06-01" },
  { id:"2", customer_name:"محمد عادل", rating:5, comment:"الفستق والكاجو من أحسن ما جربت، والتوصيل كان سريع جدًا.", image:"https://i.pravatar.cc/100?img=12", approved:true, date:"2026-06-10" },
  { id:"3", customer_name:"نور الهدى", rating:4, comment:"بوكس الشوكولاتة رائع، بس تمنيت لو فيه أحجام أكبر للتجمعات.", image:"https://i.pravatar.cc/100?img=32", approved:true, date:"2026-07-02" },
  { id:"4", customer_name:"كريم حسن", rating:5, comment:"خدمة عملاء ممتازة والرد سريع على واتساب، هطلب تاني أكيد.", image:"https://i.pravatar.cc/100?img=15", approved:true, date:"2026-07-20" }
];

const OCCASION_TAGS = [
  { id:"birthday", label:"عيد ميلاد", tag:"عيد ميلاد" },
  { id:"engagement", label:"خطوبة", tag:"خطوبة" },
  { id:"wedding", label:"زفاف", tag:"زفاف" },
  { id:"ramadan", label:"رمضان", tag:"رمضان" },
  { id:"eid", label:"العيد", tag:"العيد" },
  { id:"visit", label:"زيارة", tag:"زيارة" },
  { id:"gift", label:"هدية", tag:"هدايا" },
  { id:"gathering", label:"تجمعات", tag:"تجمعات" },
  { id:"special", label:"مناسبات خاصة", tag:"مناسبة خاصة" }
];

/* ---------------------------------------------------------------------- */
/* Data access layer                                                      */
/* ---------------------------------------------------------------------- */
const DataStore = {
  _cache: {},

  async _fetchEndpoint(endpoint){
    if(!CONFIG.WEB_APP_URL){
      throw new Error('WEB_APP_URL not configured');
    }
    const cacheKey = `infinity_cache_${endpoint}`;
    const cached = Storage.get(cacheKey, null);
    if(cached && (Date.now() - cached.ts) < CONFIG.CACHE_TTL){
      return cached.data;
    }
    const res = await fetch(`${CONFIG.WEB_APP_URL}?route=${endpoint}`);
    if(!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    Storage.set(cacheKey, { ts: Date.now(), data });
    return data;
  },

  async getProducts(){
    if(this._cache.products) return this._cache.products;
    try{
      const data = await this._fetchEndpoint('products');
      this._cache.products = this._normalizeProducts(data);
    }catch(e){
      console.warn('INFINITY: using demo product data —', e.message);
      this._cache.products = this._normalizeProducts(DEMO_PRODUCTS);
    }
    return this._cache.products;
  },

  async getCategories(){
    if(this._cache.categories) return this._cache.categories;
    try{
      this._cache.categories = await this._fetchEndpoint('categories');
    }catch(e){
      this._cache.categories = DEMO_CATEGORIES;
    }
    return this._cache.categories;
  },

  async getReviews(){
    if(this._cache.reviews) return this._cache.reviews;
    try{
      const data = await this._fetchEndpoint('reviews');
      this._cache.reviews = data.filter(r => r.approved === true || r.approved === 'true');
    }catch(e){
      this._cache.reviews = DEMO_REVIEWS;
    }
    return this._cache.reviews;
  },

  async getSettings(){
    if(this._cache.settings) return this._cache.settings;
    try{
      const data = await this._fetchEndpoint('settings');
      SETTINGS = { ...CONFIG.DEFAULT_SETTINGS, ...data };
    }catch(e){
      SETTINGS = { ...CONFIG.DEFAULT_SETTINGS };
    }
    this._cache.settings = SETTINGS;
    return SETTINGS;
  },

  /** Coerce boolean/number-ish fields that arrive as strings from Sheets */
  _normalizeProducts(list){
    const truthy = v => v === true || v === 'true' || v === 'TRUE' || v === 1 || v === '1';
    return (list || []).map(p => ({
      ...p,
      price: Number(p.price) || 0,
      old_price: p.old_price ? Number(p.old_price) : null,
      rating: Number(p.rating) || 0,
      reviews: Number(p.reviews) || 0,
      stock: Number(p.stock) || 0,
      available: truthy(p.available),
      featured: truthy(p.featured),
      best_seller: truthy(p.best_seller),
      new_product: truthy(p.new_product),
      offer: truthy(p.offer),
      tags: typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : (p.tags || [])
    }));
  },

  async getProductById(id){
    const products = await this.getProducts();
    return products.find(p => String(p.id) === String(id));
  },

  discountPercent(product){
    if(!product.old_price || product.old_price <= product.price) return 0;
    return Math.round(((product.old_price - product.price) / product.old_price) * 100);
  }
};
