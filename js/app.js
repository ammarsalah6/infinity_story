/* ==========================================================================
   INFINITY — app.js
   Everything that isn't its own dedicated file: homepage sections, the
   product-details page, and small page-specific bits (about stats,
   contact form, newsletter).
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* Homepage                                                                */
/* ---------------------------------------------------------------------- */
async function initHomePage(){
  if(!document.body.classList.contains('page-home')) return;

  const settings = await DataStore.getSettings();
  applyHeroSettings(settings);

  const [products, categories, reviews] = await Promise.all([
    DataStore.getProducts(), DataStore.getCategories(), DataStore.getReviews()
  ]);

  renderCategoriesSection(categories);
  renderBestSellers(products);
  renderOffers(products);
  renderOccasions();
  renderBrandStory(settings);
  renderReviews(reviews);

  initRevealAnimations();
}

function applyHeroSettings(settings){
  const titleEl = document.getElementById('hero-title');
  const descEl = document.getElementById('hero-desc');
  const imgEl = document.getElementById('hero-image');
  if(titleEl) titleEl.textContent = settings.hero_title;
  if(descEl) descEl.textContent = settings.hero_description;
  if(imgEl){
    imgEl.src = settings.hero_image;
    imgEl.onerror = () => { imgEl.src = 'https://placehold.co/700x600/E9D8FF/6C2BD9?text=INFINITY'; };
  }
}

function renderCategoriesSection(categories){
  const grid = document.getElementById('categories-grid');
  if(!grid) return;
  grid.innerHTML = categories.slice(0, 8).map(c => `
    <a href="products.html?category=${c.id}" class="cat-card reveal">
      <img src="${c.image}" alt="${c.name_ar}" loading="lazy" onerror="this.src='https://placehold.co/400x300/E9D8FF/6C2BD9?text=INFINITY'">
      <div class="cat-card__body">
        <div>
          <h3>${c.name_ar}</h3>
          <p>${c.description || ''}</p>
        </div>
        <span class="cat-card__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </span>
      </div>
    </a>`).join('');
}

function renderBestSellers(products){
  const grid = document.getElementById('best-sellers-grid');
  if(!grid) return;
  const list = products.filter(p => p.best_seller).slice(0, 8);
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : emptyStateHTML('لا توجد منتجات حاليًا', 'ترقّب أفضل منتجاتنا قريبًا.');
  wireProductGridEvents(grid);
}

function renderOffers(products){
  const grid = document.getElementById('offers-grid');
  if(!grid) return;
  const list = products.filter(p => p.offer).slice(0, 4);
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : emptyStateHTML('لا توجد عروض حاليًا', 'تابعنا لمعرفة أحدث العروض.');
  wireProductGridEvents(grid);
}

function renderOccasions(){
  const grid = document.getElementById('occasions-grid');
  if(!grid) return;
  grid.innerHTML = OCCASION_TAGS.map(o => `
    <a href="products.html?occasion=${encodeURIComponent(o.tag)}" class="occasion-chip reveal">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 12v9H4v-9M2 7h20v5H2V7Zm10 0V3m0 4c-1.5 0-4-1-4-3s2.5-1 4 3Zm0-4c1.5 0 4-1 4-3s-2.5-1-4 3Z"/></svg>
      <span>${o.label}</span>
    </a>`).join('');
}

function renderBrandStory(settings){
  const titleEl = document.getElementById('story-title');
  const textEl = document.getElementById('story-text');
  const imgEl = document.getElementById('story-image');
  if(titleEl) titleEl.textContent = settings.about_title;
  if(textEl) textEl.textContent = settings.about_text;
  if(imgEl){
    imgEl.src = settings.about_image;
    imgEl.onerror = () => { imgEl.src = 'https://placehold.co/700x800/E9D8FF/6C2BD9?text=INFINITY'; };
  }
  const p = document.getElementById('stat-products'); if(p) p.textContent = `+${settings.stat_products}`;
  const c = document.getElementById('stat-customers'); if(c) c.textContent = `+${settings.stat_customers}`;
  const b = document.getElementById('stat-boxes'); if(b) b.textContent = `+${settings.stat_boxes}`;
}

function renderReviews(reviews){
  const track = document.getElementById('reviews-track');
  if(!track) return;
  if(reviews.length === 0){
    track.innerHTML = emptyStateHTML('لا توجد تقييمات بعد', 'كن أول من يشارك تجربته مع انفنتي.');
    return;
  }
  track.innerHTML = reviews.map(r => `
    <div class="review-card reveal">
      <div class="review-card__stars">${starsHTML(r.rating)}</div>
      <p>"${r.comment}"</p>
      <div class="review-card__meta">
        <img src="${r.image}" alt="${r.customer_name}" onerror="this.src='https://placehold.co/80x80/E9D8FF/6C2BD9?text=I'">
        <div>
          <strong>${r.customer_name}</strong>
          <span>${r.date || ''}</span>
        </div>
      </div>
    </div>`).join('');
}

/* Newsletter form: static demo — no backend endpoint per the brief's scope */
document.addEventListener('submit', (e) => {
  if(e.target.matches('#newsletter-form')){
    e.preventDefault();
    showToast('تم الاشتراك بنجاح، شكرًا لانضمامك إلى عائلة انفنتي 💜');
    e.target.reset();
  }
  if(e.target.matches('#contact-form')){
    e.preventDefault();
    showToast('تم إرسال رسالتك، سنتواصل معك قريبًا');
    e.target.reset();
  }
});

/* ---------------------------------------------------------------------- */
/* Product details page                                                   */
/* ---------------------------------------------------------------------- */
const ProductPageState = { product:null, qty:1, selectedWeight:null };

async function initProductPage(){
  const root = document.getElementById('product-detail-root');
  if(!root) return;

  const id = getParam('id');
  const product = id ? await DataStore.getProductById(id) : null;

  if(!product){
    root.innerHTML = emptyStateHTML('المنتج غير موجود', 'قد يكون هذا المنتج غير متاح حاليًا.', 'products.html', 'عرض جميع المنتجات');
    return;
  }

  ProductPageState.product = product;
  ProductPageState.selectedWeight = product.weight;
  document.title = `${product.name_ar} | INFINITY`;

  const images = [product.image, product.image2, product.image3].filter(Boolean);
  const weights = deriveWeightOptions(product);

  root.innerHTML = `
    <div class="pd-gallery">
      <div class="pd-gallery__main"><img id="pd-main-image" src="${images[0]}" alt="${product.name_ar}" onerror="this.src='https://placehold.co/700x700/F7F1FF/6C2BD9?text=INFINITY'"></div>
      ${images.length > 1 ? `<div class="pd-gallery__thumbs">${images.map((img,i) => `<img src="${img}" class="${i===0?'is-active':''}" data-thumb onerror="this.src='https://placehold.co/100x100/F7F1FF/6C2BD9?text=I'">`).join('')}</div>` : ''}
    </div>
    <div class="pd-info">
      <span class="pd-cat">${product.subcategory || product.category}</span>
      <h1 class="pd-title">${product.name_ar}</h1>
      <div class="pd-rating"><span class="stars">${starsHTML(product.rating)}</span> ${product.rating} (${product.reviews} تقييم)</div>
      <div class="pd-price-row">
        <span class="price-current" id="pd-price">${formatPrice(product.price)}</span>
        ${product.old_price ? `<span class="price-old">${formatPrice(product.old_price)}</span>` : ''}
        ${product.offer && product.old_price ? `<span class="badge badge-offer">خصم ${DataStore.discountPercent(product)}%</span>` : ''}
      </div>
      <p class="pd-desc">${product.description}</p>

      ${weights.length > 1 ? `
      <div class="pd-weights">
        ${weights.map(w => `<button class="weight-chip ${w.value===product.weight?'is-active':''}" data-weight="${w.value}" data-price="${w.price}">${w.label}</button>`).join('')}
      </div>` : ''}

      <div class="pd-qty-row">
        <div class="qty-selector">
          <button type="button" id="pd-qty-minus">−</button>
          <input type="text" id="pd-qty-input" value="1" readonly>
          <button type="button" id="pd-qty-plus">+</button>
        </div>
        <span style="font-size:13.5px;color:var(--text-muted);">${product.available ? `متوفر (${product.stock} قطعة)` : 'غير متوفر حاليًا'}</span>
      </div>

      <div class="pd-actions">
        <button class="btn btn-outline" id="pd-add-cart" ${!product.available ? 'disabled' : ''}>أضف للسلة</button>
        <button class="btn btn-primary" id="pd-buy-now" ${!product.available ? 'disabled' : ''}>اشترِ الآن</button>
      </div>

      <div class="pd-share">
        <span>مشاركة:</span>
        <a href="#" id="pd-share-btn" aria-label="مشاركة المنتج"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg></a>
        <button class="fav-btn" style="position:static;" data-fav-toggle="${product.id}" aria-label="أضف للمفضلة">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${Favorites.has(product.id)?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
        </button>
      </div>
    </div>
  `;

  wireProductDetailEvents(product);
  await renderRelatedProducts(product);
}

function deriveWeightOptions(product){
  // Demo weight ladder derived from the product's base weight/price, since
  // the sheet stores one weight per row. Replace with real per-weight rows
  // in Google Sheets (e.g. duplicate rows) if you need exact custom prices.
  const base = Number(product.weight) || 500;
  const basePrice = product.price;
  const ratios = [0.5, 1, 2];
  return ratios.map(r => ({
    value: String(Math.round(base * r)),
    label: `${Math.round(base * r)} ${product.unit || 'جرام'}`,
    price: Math.round(basePrice * r)
  }));
}

function wireProductDetailEvents(product){
  const root = document.getElementById('product-detail-root');

  root.querySelectorAll('[data-thumb]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.getElementById('pd-main-image').src = thumb.src;
      root.querySelectorAll('[data-thumb]').forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });

  root.querySelectorAll('[data-weight]').forEach(chip => {
    chip.addEventListener('click', () => {
      root.querySelectorAll('[data-weight]').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      ProductPageState.selectedWeight = chip.getAttribute('data-weight');
      document.getElementById('pd-price').textContent = formatPrice(chip.getAttribute('data-price'));
    });
  });

  const qtyInput = document.getElementById('pd-qty-input');
  document.getElementById('pd-qty-plus').addEventListener('click', () => {
    ProductPageState.qty++;
    qtyInput.value = ProductPageState.qty;
  });
  document.getElementById('pd-qty-minus').addEventListener('click', () => {
    ProductPageState.qty = Math.max(1, ProductPageState.qty - 1);
    qtyInput.value = ProductPageState.qty;
  });

  function currentSelection(){
    const priceEl = document.getElementById('pd-price').textContent;
    const price = Number(priceEl.replace(/[^\d.]/g, '')) || product.price;
    return { ...product, price };
  }

  document.getElementById('pd-add-cart').addEventListener('click', () => {
    Cart.add(currentSelection(), ProductPageState.qty, ProductPageState.selectedWeight);
    showToast(`تمت إضافة ${product.name_ar} إلى السلة`);
    updateHeaderCounts();
  });

  document.getElementById('pd-buy-now').addEventListener('click', () => {
    Cart.add(currentSelection(), ProductPageState.qty, ProductPageState.selectedWeight);
    window.location.href = 'checkout.html';
  });

  document.getElementById('pd-share-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const shareData = { title: product.name_ar, text: product.short_description, url: window.location.href };
    if(navigator.share){
      try{ await navigator.share(shareData); }catch(e){ /* user cancelled */ }
    }else{
      await navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المنتج');
    }
  });

  root.querySelector('[data-fav-toggle]').addEventListener('click', function(){
    const active = Favorites.toggle(product.id);
    this.classList.toggle('is-active', active);
    this.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
    updateHeaderCounts();
  });
}

async function renderRelatedProducts(product){
  const grid = document.getElementById('related-products-grid');
  if(!grid) return;
  const all = await DataStore.getProducts();
  const related = all.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  grid.innerHTML = related.length ? related.map(productCardHTML).join('') : '';
  wireProductGridEvents(grid);
}

/* ---------------------------------------------------------------------- */
/* Categories page                                                        */
/* ---------------------------------------------------------------------- */
async function initCategoriesPage(){
  const grid = document.getElementById('all-categories-grid');
  if(!grid) return;
  const categories = await DataStore.getCategories();
  grid.innerHTML = categories.map(c => `
    <a href="products.html?category=${c.id}" class="cat-card reveal">
      <img src="${c.image}" alt="${c.name_ar}" loading="lazy" onerror="this.src='https://placehold.co/400x300/E9D8FF/6C2BD9?text=INFINITY'">
      <div class="cat-card__body">
        <div><h3>${c.name_ar}</h3><p>${c.description || ''}</p></div>
        <span class="cat-card__arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17 17 7M7 7h10v10"/></svg></span>
      </div>
    </a>`).join('');
  initRevealAnimations();
}

/* ---------------------------------------------------------------------- */
/* About page: fill stats + brand text from Settings                      */
/* ---------------------------------------------------------------------- */
async function initAboutPage(){
  const el = document.getElementById('about-root');
  if(!el) return;
  const settings = await DataStore.getSettings();
  document.getElementById('about-text-main').textContent = settings.about_text;
  document.getElementById('stat-products-about').textContent = `+${settings.stat_products}`;
  document.getElementById('stat-customers-about').textContent = `+${settings.stat_customers}`;
  document.getElementById('stat-boxes-about').textContent = `+${settings.stat_boxes}`;
}

/* ---------------------------------------------------------------------- */
/* Contact page: fill contact info from Settings                          */
/* ---------------------------------------------------------------------- */
async function initContactPage(){
  const el = document.getElementById('contact-info-root');
  if(!el) return;
  const settings = await DataStore.getSettings();
  document.getElementById('contact-phone').textContent = settings.phone;
  document.getElementById('contact-whatsapp').textContent = settings.whatsapp;
  document.getElementById('contact-whatsapp').href = `https://wa.me/${settings.whatsapp}`;
  document.getElementById('contact-address').textContent = settings.address;
  document.getElementById('contact-hours').textContent = settings.opening_hours;
}

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
  initProductPage();
  initCategoriesPage();
  initAboutPage();
  initContactPage();
});
