/* ==========================================================================
   INFINITY — filters.js
   Drives products.html: reads URL params for an initial state (category,
   filter=best_seller/offer/new, occasion, q=search term), then lets the
   person refine with the filter panel and sort dropdown, all client-side.
   ========================================================================== */

const ProductsPageState = {
  all: [],
  category: null,
  subcategories: [],
  occasion: null,
  query: '',
  priceMin: null,
  priceMax: null,
  minRating: 0,
  onlyAvailable: false,
  onlyOffers: false,
  onlyBestSellers: false,
  onlyNew: false,
  sort: 'newest'
};

async function initProductsPage(){
  const root = document.getElementById('products-root');
  if(!root) return;

  root.innerHTML = skeletonCardsHTML(8);

  const params = new URLSearchParams(window.location.search);
  ProductsPageState.category = params.get('category');
  ProductsPageState.occasion = params.get('occasion');
  ProductsPageState.query = params.get('q') || '';
  if(params.get('filter') === 'best_seller') ProductsPageState.onlyBestSellers = true;
  if(params.get('filter') === 'offer') ProductsPageState.onlyOffers = true;
  if(params.get('filter') === 'new') ProductsPageState.onlyNew = true;

  try{
    ProductsPageState.all = await DataStore.getProducts();
  }catch(e){
    root.innerHTML = `<div class="error-banner">تعذر تحميل المنتجات حاليًا، يرجى المحاولة مرة أخرى.</div>`;
    return;
  }

  const searchInputTop = document.getElementById('search-input-top');
  if(searchInputTop){
    searchInputTop.value = ProductsPageState.query;
    searchInputTop.addEventListener('input', debounce(() => {
      ProductsPageState.query = searchInputTop.value;
      renderProductsGrid();
    }, 250));
  }

  buildFilterPanel();
  wireToolbar();
  renderProductsGrid();
}

function debounce(fn, delay){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function buildFilterPanel(){
  const panel = document.getElementById('filters-panel');
  if(!panel) return;

  const categories = [...new Set(ProductsPageState.all.map(p => p.category))];
  const prices = ProductsPageState.all.map(p => p.price);
  const minPrice = Math.floor(Math.min(...prices) || 0);
  const maxPrice = Math.ceil(Math.max(...prices) || 1000);

  panel.innerHTML = `
    <div class="filters-panel__close" style="display:none;">
      <button class="icon-btn" id="close-filters"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <h3>الفلاتر</h3>

    <div class="filter-group">
      <h4>التصنيف</h4>
      ${categories.map(c => `
        <label class="filter-option">
          <input type="checkbox" value="${c}" data-filter="category" ${ProductsPageState.category === c ? 'checked' : ''}>
          ${categoryLabel(c)}
        </label>`).join('')}
    </div>

    <div class="filter-group">
      <h4>السعر (${CONFIG.CURRENCY_SYMBOL})</h4>
      <div class="price-range-inputs">
        <input type="number" placeholder="من" id="price-min" min="${minPrice}" max="${maxPrice}">
        <span>—</span>
        <input type="number" placeholder="إلى" id="price-max" min="${minPrice}" max="${maxPrice}">
      </div>
    </div>

    <div class="filter-group">
      <h4>التقييم</h4>
      ${[4,3].map(r => `
        <label class="filter-option">
          <input type="radio" name="rating" value="${r}" data-filter="rating">
          ${r} نجوم فأكثر
        </label>`).join('')}
    </div>

    <div class="filter-group">
      <label class="filter-option"><input type="checkbox" id="f-available"> متوفر فقط</label>
      <label class="filter-option"><input type="checkbox" id="f-offer" ${ProductsPageState.onlyOffers ? 'checked' : ''}> العروض فقط</label>
      <label class="filter-option"><input type="checkbox" id="f-best" ${ProductsPageState.onlyBestSellers ? 'checked' : ''}> الأكثر مبيعًا</label>
      <label class="filter-option"><input type="checkbox" id="f-new" ${ProductsPageState.onlyNew ? 'checked' : ''}> منتجات جديدة</label>
    </div>

    <button class="btn btn-outline btn-block btn-sm" id="reset-filters">إعادة تعيين</button>
  `;

  panel.addEventListener('change', (e) => {
    if(e.target.matches('[data-filter="category"]')){
      const checked = [...panel.querySelectorAll('[data-filter="category"]:checked')].map(i => i.value);
      ProductsPageState.category = checked[checked.length - 1] || null;
      // keep single-select feel: uncheck others
      panel.querySelectorAll('[data-filter="category"]').forEach(i => { if(i.value !== ProductsPageState.category) i.checked = false; });
    }
    if(e.target.matches('[data-filter="rating"]')) ProductsPageState.minRating = Number(e.target.value);
    if(e.target.id === 'f-available') ProductsPageState.onlyAvailable = e.target.checked;
    if(e.target.id === 'f-offer') ProductsPageState.onlyOffers = e.target.checked;
    if(e.target.id === 'f-best') ProductsPageState.onlyBestSellers = e.target.checked;
    if(e.target.id === 'f-new') ProductsPageState.onlyNew = e.target.checked;
    renderProductsGrid();
  });

  panel.querySelector('#price-min').addEventListener('input', debounce((e) => {
    ProductsPageState.priceMin = e.target.value ? Number(e.target.value) : null;
    renderProductsGrid();
  }, 300));
  panel.querySelector('#price-max').addEventListener('input', debounce((e) => {
    ProductsPageState.priceMax = e.target.value ? Number(e.target.value) : null;
    renderProductsGrid();
  }, 300));

  panel.querySelector('#reset-filters').addEventListener('click', () => {
    Object.assign(ProductsPageState, {
      category:null, occasion:null, query:'', priceMin:null, priceMax:null,
      minRating:0, onlyAvailable:false, onlyOffers:false, onlyBestSellers:false, onlyNew:false
    });
    history.replaceState(null, '', 'products.html');
    buildFilterPanel();
    renderProductsGrid();
  });

  panel.querySelector('#close-filters')?.addEventListener('click', () => panel.classList.remove('is-open'));
}

function categoryLabel(catId){
  const map = { nuts:'المكسرات', chocolate:'الشوكولاتة', candy:'الكاندي', snacks:'السناكس', sweets:'الحلويات', derivatives:'مشتقات المكسرات', 'gift-boxes':'بوكسات الهدايا' };
  return map[catId] || catId;
}

function wireToolbar(){
  const sortSelect = document.getElementById('sort-select');
  sortSelect?.addEventListener('change', () => {
    ProductsPageState.sort = sortSelect.value;
    renderProductsGrid();
  });

  document.getElementById('mobile-filter-toggle')?.addEventListener('click', () => {
    document.getElementById('filters-panel').classList.add('is-open');
    document.querySelector('.filters-panel__close').style.display = 'flex';
  });
}

function getFilteredSortedProducts(){
  let list = ProductsPageState.all.filter(p => {
    if(ProductsPageState.category && p.category !== ProductsPageState.category) return false;
    if(ProductsPageState.query && !productMatchesQuery(p, ProductsPageState.query)) return false;
    if(ProductsPageState.occasion && !(Array.isArray(p.tags) && p.tags.some(t => t.includes(ProductsPageState.occasion)))) return false;
    if(ProductsPageState.priceMin !== null && p.price < ProductsPageState.priceMin) return false;
    if(ProductsPageState.priceMax !== null && p.price > ProductsPageState.priceMax) return false;
    if(ProductsPageState.minRating && p.rating < ProductsPageState.minRating) return false;
    if(ProductsPageState.onlyAvailable && !p.available) return false;
    if(ProductsPageState.onlyOffers && !p.offer) return false;
    if(ProductsPageState.onlyBestSellers && !p.best_seller) return false;
    if(ProductsPageState.onlyNew && !p.new_product) return false;
    return true;
  });

  switch(ProductsPageState.sort){
    case 'price_asc': list.sort((a,b) => a.price - b.price); break;
    case 'price_desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating': list.sort((a,b) => b.rating - a.rating); break;
    case 'best_seller': list.sort((a,b) => (b.best_seller - a.best_seller)); break;
    default: list.sort((a,b) => (b.new_product - a.new_product) || (Number(b.id) - Number(a.id)));
  }
  return list;
}

function renderProductsGrid(){
  const root = document.getElementById('products-root');
  const countEl = document.getElementById('results-count');
  const list = getFilteredSortedProducts();

  if(countEl) countEl.textContent = `${list.length} منتج`;

  if(list.length === 0){
    root.className = '';
    root.innerHTML = emptyStateHTML('لم نجد ما تبحث عنه', 'جرّب كلمة بحث مختلفة أو ألغِ بعض الفلاتر.', 'products.html', 'عرض جميع المنتجات');
    return;
  }

  root.className = 'products-grid';
  root.innerHTML = list.map(productCardHTML).join('');
  wireProductGridEvents(root);
}

document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
});
