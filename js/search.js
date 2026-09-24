/* ==========================================================================
   INFINITY — search.js
   Two jobs: (1) live suggestions dropdown in the header, (2) the matching
   function reused by filters.js on the products page.
   ========================================================================== */

/** Returns true if a product matches a free-text query across the fields
 *  the brief asked for: name, name_ar, category, description, tags */
function productMatchesQuery(product, query){
  if(!query) return true;
  const q = query.trim().toLowerCase();
  const haystack = [
    product.name_ar,
    product.name,
    product.category,
    product.subcategory,
    product.description,
    ...(Array.isArray(product.tags) ? product.tags : [])
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

let _searchDebounce;
async function onSearchInput(value){
  clearTimeout(_searchDebounce);
  const box = document.getElementById('search-suggestions');
  if(!box) return;

  if(!value || value.trim().length < 2){
    box.innerHTML = '';
    return;
  }

  _searchDebounce = setTimeout(async () => {
    const products = await DataStore.getProducts();
    const matches = products.filter(p => productMatchesQuery(p, value)).slice(0, 6);

    if(matches.length === 0){
      box.innerHTML = `<div class="suggestion-row" style="color:var(--text-muted);">لا توجد نتائج لـ "${value}"</div>`;
      return;
    }

    box.innerHTML = matches.map(p => `
      <a class="suggestion-row" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name_ar}" onerror="this.src='https://placehold.co/80x80/F7F1FF/6C2BD9?text=I'">
        <div>
          <div style="font-weight:700;font-size:14px;color:var(--text-dark);">${p.name_ar}</div>
          <div style="font-size:12.5px;color:var(--text-muted);">${formatPrice(p.price)}</div>
        </div>
      </a>
    `).join('');
  }, 220);
}
