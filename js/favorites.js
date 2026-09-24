/* ==========================================================================
   INFINITY — favorites.js
   Wishlist stored in localStorage as an array of product ids.
   ========================================================================== */

const FAV_KEY = 'infinity_favorites_v1';

const Favorites = {
  get(){
    return Storage.get(FAV_KEY, []);
  },
  has(id){
    return this.get().includes(String(id));
  },
  toggle(id){
    let ids = this.get();
    const strId = String(id);
    if(ids.includes(strId)){
      ids = ids.filter(x => x !== strId);
    }else{
      ids.push(strId);
    }
    Storage.set(FAV_KEY, ids);
    return ids.includes(strId);
  }
};

/* ---------------------------------------------------------------------- */
/* Favorites page rendering (only runs if #favorites-root exists)         */
/* ---------------------------------------------------------------------- */
async function renderFavoritesPage(){
  const root = document.getElementById('favorites-root');
  if(!root) return;

  root.innerHTML = skeletonCardsHTML(4);
  const ids = Favorites.get();

  if(ids.length === 0){
    root.innerHTML = emptyStateHTML('لا توجد منتجات مفضلة', 'اضغط على أيقونة القلب في أي منتج لإضافته هنا.', 'products.html', 'تصفح المنتجات');
    return;
  }

  const allProducts = await DataStore.getProducts();
  const favProducts = allProducts.filter(p => ids.includes(String(p.id)));

  if(favProducts.length === 0){
    root.innerHTML = emptyStateHTML('لا توجد منتجات مفضلة', 'اضغط على أيقونة القلب في أي منتج لإضافته هنا.', 'products.html', 'تصفح المنتجات');
    return;
  }

  root.className = 'products-grid';
  root.innerHTML = favProducts.map(productCardHTML).join('');
  wireProductGridEvents(root);
}

document.addEventListener('DOMContentLoaded', () => {
  renderFavoritesPage();
});
