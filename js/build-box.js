/* ==========================================================================
   INFINITY — build-box.js
   "كوّن بوكسك بنفسك" — a modular box builder. Each step is data-driven so
   new options can be added just by editing the arrays below (and later,
   wired to a Google Sheet the same way products.js is, once a real backend
   exists — see the comment at the bottom).
   ========================================================================== */

const BOX_TYPES = [
  { id:"classic", label:"بوكس كلاسيك", price:80, img:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80" },
  { id:"premium", label:"بوكس بريميوم", price:150, img:"https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=300&q=80" },
  { id:"luxury", label:"بوكس Luxury", price:250, img:"https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=300&q=80" }
];
const BOX_SIZES = [
  { id:"small", label:"صغير", multiplier:1, extra:0 },
  { id:"medium", label:"وسط", multiplier:1.4, extra:60 },
  { id:"large", label:"كبير", multiplier:1.8, extra:130 }
];
const BOX_NUTS = [
  { id:"pistachio", label:"فستق", price:40 },
  { id:"cashew", label:"كاجو", price:45 },
  { id:"almond", label:"لوز", price:35 },
  { id:"hazelnut", label:"بندق", price:40 },
  { id:"walnut", label:"عين جمل", price:35 }
];
const BOX_CHOCOLATE = [
  { id:"milk", label:"شوكولاتة ميلك", price:30 },
  { id:"dark", label:"شوكولاتة دارك", price:30 },
  { id:"white", label:"شوكولاتة وايت", price:35 }
];
const BOX_CANDY = [
  { id:"gummy", label:"كاندي جيلي", price:20 },
  { id:"marshmallow", label:"مارشميلو", price:20 },
  { id:"lollipop", label:"لوليبوب", price:15 }
];
const BOX_ADDONS = [
  { id:"card", label:"كارت تهنئة", price:15 },
  { id:"ribbon", label:"ريبون ذهبي", price:20 },
  { id:"dried_fruit", label:"فواكه مجففة", price:35 }
];
const BOX_WRAPPING = [
  { id:"standard", label:"تغليف عادي", price:0 },
  { id:"premium", label:"تغليف Premium", price:35 },
  { id:"luxury", label:"تغليف Luxury ذهبي", price:60 }
];

const BoxState = {
  type: BOX_TYPES[0].id,
  size: BOX_SIZES[0].id,
  nuts: [],
  chocolate: [],
  candy: [],
  addons: [],
  wrapping: BOX_WRAPPING[0].id
};

function calcBoxPrice(){
  const type = BOX_TYPES.find(t => t.id === BoxState.type);
  const size = BOX_SIZES.find(s => s.id === BoxState.size);
  const itemsTotal =
    BoxState.nuts.reduce((s,id) => s + BOX_NUTS.find(n=>n.id===id).price, 0) +
    BoxState.chocolate.reduce((s,id) => s + BOX_CHOCOLATE.find(n=>n.id===id).price, 0) +
    BoxState.candy.reduce((s,id) => s + BOX_CANDY.find(n=>n.id===id).price, 0) +
    BoxState.addons.reduce((s,id) => s + BOX_ADDONS.find(n=>n.id===id).price, 0);
  const wrapping = BOX_WRAPPING.find(w => w.id === BoxState.wrapping);

  const base = (type.price + itemsTotal) * size.multiplier + size.extra;
  return Math.round(base + wrapping.price);
}

function optionGroupHTML(items, selectedIds, groupKey, multi = true){
  return `<div class="box-options-grid">${items.map(opt => `
    <div class="box-option ${selectedIds.includes(opt.id) ? 'is-selected' : ''}" data-group="${groupKey}" data-id="${opt.id}" data-multi="${multi}">
      ${opt.img ? `<img src="${opt.img}" alt="${opt.label}" onerror="this.src='https://placehold.co/200x120/F7F1FF/6C2BD9?text=INFINITY'">` : ''}
      <span>${opt.label}</span>
      ${opt.price ? `<small>+${formatPrice(opt.price)}</small>` : (opt.price === 0 ? '<small>بدون تكلفة إضافية</small>' : '')}
    </div>`).join('')}</div>`;
}

function renderBoxBuilder(){
  const root = document.getElementById('box-builder-root');
  if(!root) return;

  root.innerHTML = `
    <div>
      <div class="box-step reveal">
        <h3><span class="step-num">1</span> اختر نوع البوكس</h3>
        ${optionGroupHTML(BOX_TYPES, [BoxState.type], 'type', false)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">2</span> اختر حجم البوكس</h3>
        ${optionGroupHTML(BOX_SIZES, [BoxState.size], 'size', false)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">3</span> اختر المكسرات</h3>
        ${optionGroupHTML(BOX_NUTS, BoxState.nuts, 'nuts', true)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">4</span> اختر الشوكولاتة</h3>
        ${optionGroupHTML(BOX_CHOCOLATE, BoxState.chocolate, 'chocolate', true)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">5</span> اختر الكاندي</h3>
        ${optionGroupHTML(BOX_CANDY, BoxState.candy, 'candy', true)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">6</span> إضافات (اختياري)</h3>
        ${optionGroupHTML(BOX_ADDONS, BoxState.addons, 'addons', true)}
      </div>
      <div class="box-step reveal">
        <h3><span class="step-num">7</span> اختر التغليف</h3>
        ${optionGroupHTML(BOX_WRAPPING, [BoxState.wrapping], 'wrapping', false)}
      </div>
    </div>
  `;

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.box-option');
    if(!opt) return;
    const group = opt.getAttribute('data-group');
    const id = opt.getAttribute('data-id');
    const multi = opt.getAttribute('data-multi') === 'true';

    if(multi){
      const list = BoxState[group];
      const idx = list.indexOf(id);
      if(idx > -1) list.splice(idx, 1); else list.push(id);
    }else{
      BoxState[group] = id;
    }
    renderBoxBuilder();
    renderBoxSummary();
  });

  renderBoxSummary();
}

function renderBoxSummary(){
  const el = document.getElementById('box-summary-root');
  if(!el) return;
  const type = BOX_TYPES.find(t => t.id === BoxState.type);
  const size = BOX_SIZES.find(s => s.id === BoxState.size);
  const price = calcBoxPrice();

  const pickedLabels = [
    ...BoxState.nuts.map(id => BOX_NUTS.find(n=>n.id===id).label),
    ...BoxState.chocolate.map(id => BOX_CHOCOLATE.find(n=>n.id===id).label),
    ...BoxState.candy.map(id => BOX_CANDY.find(n=>n.id===id).label),
    ...BoxState.addons.map(id => BOX_ADDONS.find(n=>n.id===id).label)
  ];

  el.innerHTML = `
    <div class="box-summary__preview"><img src="${type.img}" alt="${type.label}" style="width:100%;height:100%;object-fit:cover;"></div>
    <h3>${type.label} — حجم ${size.label}</h3>
    <ul class="box-summary__list">
      ${pickedLabels.length ? pickedLabels.map(l => `<li><span>${l}</span></li>`).join('') : '<li><span style="color:var(--text-muted)">لم تختر مكونات إضافية بعد</span></li>'}
      <li><span>التغليف</span><span>${BOX_WRAPPING.find(w=>w.id===BoxState.wrapping).label}</span></li>
    </ul>
    <div class="summary-row total"><span>السعر الإجمالي</span><span>${formatPrice(price)}</span></div>
    <button class="btn btn-primary btn-block" id="add-box-to-cart">أضف البوكس إلى السلة</button>
  `;

  document.getElementById('add-box-to-cart').addEventListener('click', () => {
    const customProduct = {
      id: `custom-box-${Date.now()}`,
      name_ar: `بوكس مخصص — ${type.label}`,
      image: type.img,
      price: price,
      weight: size.label,
      unit: ''
    };
    Cart.add(customProduct, 1, size.label);
    showToast('تمت إضافة بوكسك المخصص إلى السلة');
    updateHeaderCounts();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('box-builder-root')){
    renderBoxBuilder();
  }
});

/* ---------------------------------------------------------------------- */
/* Future backend note:                                                   */
/* To connect this to a real backend/inventory system later, replace the  */
/* BOX_* constant arrays with data fetched from DataStore (same pattern   */
/* as getProducts()), and change "add-box-to-cart" to POST the selected   */
/* combination to your order API before adding it to the cart.            */
/* ---------------------------------------------------------------------- */
