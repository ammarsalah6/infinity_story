/* ==========================================================================
   INFINITY — checkout.js
   Renders the order summary, validates the shipping form, and builds the
   WhatsApp message so an order can be placed without a real backend.
   The WhatsApp number always comes from Settings — never hardcoded here.
   ========================================================================== */

function renderCheckoutSummary(){
  const el = document.getElementById('checkout-summary');
  if(!el) return;

  const items = Cart.getItems();
  if(items.length === 0){
    el.innerHTML = emptyStateHTML('سلتك فارغة', 'أضف منتجات إلى السلة قبل إتمام الطلب.', 'products.html', 'ابدأ التسوق');
    document.getElementById('checkout-form')?.querySelectorAll('input,select,textarea,button').forEach(f => f.disabled = true);
    return;
  }

  const subtotal = Cart.subtotal();
  const freeShippingLimit = Number(SETTINGS.free_shipping_limit) || 500;
  const shipping = subtotal >= freeShippingLimit ? 0 : 40;
  const total = subtotal + shipping;

  el.innerHTML = `
    <h3>ملخص الطلب</h3>
    <ul class="box-summary__list">
      ${items.map(i => `<li><span>${i.name_ar} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></li>`).join('')}
    </ul>
    <div class="summary-row"><span>المجموع الفرعي</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>الشحن</span><span>${shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
    <div class="summary-row total"><span>الإجمالي</span><span>${formatPrice(total)}</span></div>
  `;
}

function buildWhatsAppMessage(formData){
  const items = Cart.getItems();
  const subtotal = Cart.subtotal();
  const freeShippingLimit = Number(SETTINGS.free_shipping_limit) || 500;
  const shipping = subtotal >= freeShippingLimit ? 0 : 40;
  const total = subtotal + shipping;

  const lines = [
    `*طلب جديد من موقع INFINITY*`,
    ``,
    `👤 *الاسم:* ${formData.name}`,
    `📱 *الهاتف:* ${formData.phone}`,
    `📍 *المحافظة:* ${formData.governorate}`,
    `🏙️ *المدينة:* ${formData.city}`,
    `🏠 *العنوان:* ${formData.address}`,
    formData.notes ? `📝 *ملاحظات:* ${formData.notes}` : null,
    ``,
    `*المنتجات:*`,
    ...items.map(i => `• ${i.name_ar} ${i.weight ? '(' + i.weight + (i.unit || '') + ')' : ''} × ${i.qty} = ${formatPrice(i.price * i.qty)}`),
    ``,
    `المجموع الفرعي: ${formatPrice(subtotal)}`,
    `الشحن: ${shipping === 0 ? 'مجاني' : formatPrice(shipping)}`,
    `*الإجمالي: ${formatPrice(total)}*`,
    ``,
    `طريقة الدفع: الدفع عند الاستلام`
  ].filter(Boolean);

  return lines.join('\n');
}

function initCheckoutForm(){
  const form = document.getElementById('checkout-form');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(Cart.getItems().length === 0){
      showToast('سلتك فارغة');
      return;
    }
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    const formData = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      governorate: form.governorate.value,
      city: form.city.value.trim(),
      address: form.address.value.trim(),
      notes: form.notes.value.trim()
    };

    const message = buildWhatsAppMessage(formData);
    const whatsappNumber = SETTINGS.whatsapp;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    showToast('جاري تحويلك إلى واتساب لتأكيد الطلب...');
    setTimeout(() => {
      window.open(url, '_blank');
    }, 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderCheckoutSummary();
    initCheckoutForm();
  }, 60);
});
