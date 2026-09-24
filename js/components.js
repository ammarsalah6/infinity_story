/* ==========================================================================
   INFINITY — components.js
   Renders the shared header/footer into every page (so we don't paste the
   same markup into 10 HTML files) and holds small reusable render helpers
   used across pages: product cards, star ratings, skeleton loaders.
   ========================================================================== */

const NAV_LINKS = [
  { href:"index.html", label:"الرئيسية" },
  { href:"products.html", label:"المنتجات" },
  { href:"categories.html", label:"التصنيفات" },
  { href:"products.html?filter=best_seller", label:"الأكثر مبيعًا" },
  { href:"products.html?filter=offer", label:"العروض" },
  { href:"build-box.html", label:"بوكسات الهدايا" },
  { href:"about.html", label:"عن انفنتي" },
  { href:"contact.html", label:"تواصل معنا" }
];

function currentPage(){
  return window.location.pathname.split('/').pop() || 'index.html';
}

function renderHeader(){
  const mount = document.getElementById('site-header');
  if(!mount) return;
  const page = currentPage();

  mount.innerHTML = `
  <header class="site-header" id="site-header-el">
    <div class="container header-inner">
      <a href="index.html" class="brand" aria-label="INFINITY - الرئيسية">
        <span class="brand__mark">I</span>
        <span class="brand__text"><strong>INFINITY</strong><span>ANFINITY STORE</span></span>
      </a>

      <nav class="main-nav" aria-label="التنقل الرئيسي">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="${l.href.split('?')[0] === page ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>

      <div class="header-actions">
        <button class="icon-btn" id="search-toggle" aria-label="بحث" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <a href="favorites.html" class="icon-btn" aria-label="المفضلة">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
          <span class="count" id="fav-count" style="display:none;">0</span>
        </a>
        <a href="cart.html" class="icon-btn" aria-label="سلة المشتريات">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <span class="count" id="cart-count" style="display:none;">0</span>
        </a>
        <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="القائمة" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>

    <div class="header-search" id="header-search">
      <div class="container">
        <div class="header-search__box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="search" id="search-input" placeholder="ابحث عن مكسرات، شوكولاتة، كاندي..." autocomplete="off" />
        </div>
      </div>
      <div id="search-suggestions"></div>
    </div>

    <nav class="mobile-nav" id="mobile-nav" aria-label="القائمة على الموبايل"
         style="display:none; background:#fff; border-top:1px solid var(--soft-purple); padding:10px 20px 20px;">
      ${NAV_LINKS.map(l => `<a href="${l.href}" style="display:block; padding:12px 0; font-weight:700; border-bottom:1px solid var(--very-light-purple);">${l.label}</a>`).join('')}
    </nav>
  </header>`;

  wireHeaderInteractions();
  updateHeaderCounts();
}

function wireHeaderInteractions(){
  const headerEl = document.getElementById('site-header-el');
  window.addEventListener('scroll', () => {
    headerEl.classList.toggle('is-scrolled', window.scrollY > 12);
  });

  const searchToggle = document.getElementById('search-toggle');
  const searchPanel = document.getElementById('header-search');
  const searchInput = document.getElementById('search-input');
  searchToggle.addEventListener('click', () => {
    const isOpen = searchPanel.classList.toggle('is-open');
    searchToggle.setAttribute('aria-expanded', String(isOpen));
    if(isOpen) setTimeout(() => searchInput.focus(), 150);
  });
  if(searchInput && typeof onSearchInput === 'function'){
    searchInput.addEventListener('input', (e) => onSearchInput(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' && searchInput.value.trim()){
        window.location.href = `products.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.style.display !== 'none';
    mobileNav.style.display = isOpen ? 'none' : 'block';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

function updateHeaderCounts(){
  const cartCount = document.getElementById('cart-count');
  const favCount = document.getElementById('fav-count');
  if(cartCount && typeof Cart !== 'undefined'){
    const n = Cart.totalItems();
    cartCount.textContent = n;
    cartCount.style.display = n > 0 ? 'flex' : 'none';
  }
  if(favCount && typeof Favorites !== 'undefined'){
    const n = Favorites.get().length;
    favCount.textContent = n;
    favCount.style.display = n > 0 ? 'flex' : 'none';
  }
}

function renderFooter(settings){
  const mount = document.getElementById('site-footer');
  if(!mount) return;
  const s = settings || SETTINGS;

  mount.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand">
            <span class="brand__mark">I</span>
            <span class="brand__text"><strong>INFINITY</strong></span>
          </div>
          <p>${s.footer_text}</p>
          <div class="footer-social">
            <a href="${s.facebook}" aria-label="Facebook" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></svg></a>
            <a href="${s.instagram}" aria-label="Instagram" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
            <a href="${s.tiktok}" aria-label="TikTok" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8a4.3 4.3 0 0 1-3-3.8h-3v13.6a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.9 5.9 0 0 0-.8-.1A5.9 5.9 0 1 0 13.6 15V9.2a7.3 7.3 0 0 0 4.2 1.3v-3a4.3 4.3 0 0 1-1.2-1.7Z"/></svg></a>
            <a href="https://wa.me/${s.whatsapp}" aria-label="WhatsApp" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.1-.4 0-.1-.5-1.3-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.7 2.7 4.2 3.7.6.3 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2Z"/></svg></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="index.html">الرئيسية</a></li>
            <li><a href="products.html">المنتجات</a></li>
            <li><a href="categories.html">التصنيفات</a></li>
            <li><a href="products.html?filter=offer">العروض</a></li>
            <li><a href="about.html">عن انفنتي</a></li>
            <li><a href="contact.html">تواصل معنا</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>تسوق</h4>
          <ul>
            <li><a href="build-box.html">كوّن بوكسك</a></li>
            <li><a href="favorites.html">المفضلة</a></li>
            <li><a href="cart.html">السلة</a></li>
            <li><a href="checkout.html">إتمام الطلب</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>تواصل معنا</h4>
          <ul>
            <li>${s.phone}</li>
            <li><a href="https://wa.me/${s.whatsapp}" target="_blank" rel="noopener">واتساب: ${s.whatsapp}</a></li>
            <li>${s.address}</li>
            <li>${s.opening_hours}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} INFINITY — جميع الحقوق محفوظة</span>
        <span>صُنع بحب لعشاق المكسرات والشوكولاتة 💜</span>
      </div>
    </div>
  </footer>`;
}

/* ---------------------------------------------------------------------- */
/* Reusable render helpers                                                */
/* ---------------------------------------------------------------------- */
function starsHTML(rating){
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function productBadgesHTML(p){
  const badges = [];
  if(!p.available) return `<span class="badge badge-out">غير متوفر</span>`;
  if(p.best_seller) badges.push(`<span class="badge badge-best">الأكثر مبيعًا</span>`);
  if(p.new_product) badges.push(`<span class="badge badge-new">جديد</span>`);
  if(p.offer && p.old_price){
    const pct = DataStore.discountPercent(p);
    badges.push(`<span class="badge badge-offer">خصم ${pct}%</span>`);
  }
  return badges.join('');
}

function productCardHTML(p){
  const isFav = typeof Favorites !== 'undefined' && Favorites.has(p.id);
  return `
  <article class="product-card" data-id="${p.id}">
    <div class="product-card__media">
      <div class="product-card__badges">${productBadgesHTML(p)}</div>
      <button class="fav-btn ${isFav ? 'is-active' : ''}" data-fav-toggle="${p.id}" aria-label="أضف للمفضلة">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
      </button>
      <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name_ar}" loading="lazy" onerror="this.src='https://placehold.co/500x500/F7F1FF/6C2BD9?text=INFINITY'"></a>
    </div>
    <div class="product-card__body">
      <span class="product-card__cat">${p.subcategory || p.category}</span>
      <h3 class="product-card__name"><a href="product.html?id=${p.id}">${p.name_ar}</a></h3>
      <div class="product-card__rating"><span class="stars">${starsHTML(p.rating)}</span> (${p.reviews})</div>
      <div class="product-card__price-row">
        <span class="price-current">${formatPrice(p.price)}</span>
        ${p.old_price ? `<span class="price-old">${formatPrice(p.old_price)}</span>` : ''}
      </div>
    </div>
    <div class="product-card__actions">
      ${p.available
        ? `<button class="btn btn-primary btn-block btn-sm" data-add-to-cart="${p.id}">أضف للسلة</button>`
        : `<div class="product-card__unavailable">غير متوفر حاليًا</div>`}
    </div>
  </article>`;
}

function skeletonCardsHTML(count = 8){
  return Array.from({ length: count }).map(() => `<div class="skeleton-card skeleton"></div>`).join('');
}

function emptyStateHTML(title, text, ctaHref, ctaLabel){
  return `
  <div class="empty-state">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
    <h3>${title}</h3>
    <p>${text}</p>
    ${ctaHref ? `<a href="${ctaHref}" class="btn btn-primary">${ctaLabel}</a>` : ''}
  </div>`;
}

/** Wire up "add to cart" and "favorite" buttons inside any container via delegation */
function wireProductGridEvents(container){
  container.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    const favBtn = e.target.closest('[data-fav-toggle]');
    if(addBtn){
      const id = addBtn.getAttribute('data-add-to-cart');
      const product = await DataStore.getProductById(id);
      if(product){
        Cart.add(product, 1);
        showToast(`تمت إضافة ${product.name_ar} إلى السلة`);
        updateHeaderCounts();
      }
    }
    if(favBtn){
      const id = favBtn.getAttribute('data-fav-toggle');
      const active = Favorites.toggle(id);
      favBtn.classList.toggle('is-active', active);
      favBtn.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
      updateHeaderCounts();
    }
  });
}

/** Reveal-on-scroll using IntersectionObserver */
function initRevealAnimations(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => observer.observe(el));
}

/* Boot: every page renders header + footer as soon as the DOM is ready */
document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  try{
    const settings = await DataStore.getSettings();
    renderFooter(settings);
    document.querySelectorAll('[data-whatsapp-link]').forEach(a => a.href = `https://wa.me/${settings.whatsapp}`);
  }catch(e){
    renderFooter(CONFIG.DEFAULT_SETTINGS);
  }
  initRevealAnimations();
});
