/* ==========================================================================
   INFINITY — cart.js
   Cart persisted in localStorage so it survives refreshes. Cart items store
   a snapshot of price/image/name at add-time so totals stay correct even if
   product info changes later in the sheet.
   ========================================================================== */

const CART_KEY = 'infinity_cart_v1';

const Cart = {
  getItems(){
    return Storage.get(CART_KEY, []);
  },

  _save(items){
    Storage.set(CART_KEY, items);
  },

  add(product, qty = 1, weight = null){
    const items = this.getItems();
    const lineId = `${product.id}__${weight || product.weight || 'default'}`;
    const existing = items.find(i => i.lineId === lineId);
    if(existing){
      existing.qty += qty;
    }else{
      items.push({
        lineId,
        id: product.id,
        name_ar: product.name_ar,
        image: product.image,
        price: product.price,
        weight: weight || product.weight,
        unit: product.unit,
        qty
      });
    }
    this._save(items);
  },

  updateQty(lineId, qty){
    let items = this.getItems();
    if(qty <= 0){
      items = items.filter(i => i.lineId !== lineId);
    }else{
      const item = items.find(i => i.lineId === lineId);
      if(item) item.qty = qty;
    }
    this._save(items);
  },

  remove(lineId){
    const items = this.getItems().filter(i => i.lineId !== lineId);
    this._save(items);
  },

  clear(){
    this._save([]);
  },

  totalItems(){
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  subtotal(){
    return this.getItems().reduce((sum, i) => sum + (i.price * i.qty), 0);
  }
};

/* ---------------------------------------------------------------------- */
/* Cart page rendering (only runs if #cart-root exists on the page)       */
/* ---------------------------------------------------------------------- */
function renderCartPage(){
  const root = document.getElementById('cart-root');
  if(!root) return;

  const items = Cart.getItems();

  if(items.length === 0){
    root.innerHTML = emptyStateHTML('سلتك فارغة', 'لم تقم بإضافة أي منتجات بعد.', 'products.html', 'ابدأ التسوق');
    document.getElementById('cart-summary-wrap')?.remove();
    return;
  }

  root.innerHTML = `
    <div class="cart-table">
      ${items.map(i => `
        <div class="cart-row" data-line="${i.lineId}">
          <img src="${i.image}" alt="${i.name_ar}" onerror="this.src='https://placehold.co/150x150/F7F1FF/6C2BD9?text=INFINITY'">
          <div>
            <div class="cart-row__name">${i.name_ar}</div>
            <div class="cart-row__meta">${i.weight ? i.weight + ' ' + (i.unit || '') : ''}</div>
          </div>
          <div class="qty-selector">
            <button type="button" data-qty-minus>−</button>
            <input type="text" value="${i.qty}" data-qty-input readonly>
            <button type="button" data-qty-plus>+</button>
          </div>
          <strong>${formatPrice(i.price * i.qty)}</strong>
          <button class="cart-row__remove" data-remove>إزالة</button>
        </div>
      `).join('')}
    </div>`;

  root.addEventListener('click', (e) => {
    const row = e.target.closest('.cart-row');
    if(!row) return;
    const lineId = row.getAttribute('data-line');
    const item = Cart.getItems().find(i => i.lineId === lineId);
    if(!item) return;

    if(e.target.closest('[data-qty-plus]')) Cart.updateQty(lineId, item.qty + 1);
    if(e.target.closest('[data-qty-minus]')) Cart.updateQty(lineId, item.qty - 1);
    if(e.target.closest('[data-remove]')) Cart.updateQty(lineId, 0);

    renderCartPage();
    renderCartSummary();
    updateHeaderCounts();
  });

  renderCartSummary();
}

function renderCartSummary(){
  const summaryEl = document.getElementById('cart-summary');
  if(!summaryEl) return;
  const subtotal = Cart.subtotal();
  const freeShippingLimit = Number(SETTINGS.free_shipping_limit) || 500;
  const shipping = subtotal >= freeShippingLimit || subtotal === 0 ? 0 : 40;
  const total = subtotal + shipping;

  summaryEl.innerHTML = `
    <h3>ملخص الطلب</h3>
    <div class="summary-row"><span>عدد المنتجات</span><span>${Cart.totalItems()}</span></div>
    <div class="summary-row"><span>المجموع الفرعي</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>الشحن</span><span>${shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
    <div class="summary-row total"><span>الإجمالي</span><span>${formatPrice(total)}</span></div>
    <div class="cart-actions">
      <a href="checkout.html" class="btn btn-primary btn-block">إتمام الطلب</a>
      <button class="btn btn-outline btn-block" id="clear-cart-btn">إفراغ السلة</button>
    </div>
    ${shipping > 0 ? `<p style="font-size:12.5px;color:var(--text-muted);margin-top:12px;text-align:center;">أضف ${formatPrice(freeShippingLimit - subtotal)} أخرى للحصول على شحن مجاني</p>` : ''}
  `;

  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    if(confirm('هل تريد إفراغ السلة بالكامل؟')){
      Cart.clear();
      renderCartPage();
      updateHeaderCounts();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Slight delay so header/footer (which set SETTINGS) can finish first.
  setTimeout(() => { renderCartPage(); }, 50);
});
