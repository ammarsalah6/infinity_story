# INFINITY | انفنتي — موقع البراند والمتجر الإلكتروني

موقع كامل لبراند INFINITY (انفنتي) — منصة تعريفية + متجر إلكتروني، مبني بـ
HTML / CSS / Vanilla JavaScript فقط، ومربوط بـ Google Sheets كمصدر بيانات.

---

## 1) تحليل سريع للمتطلبات والقرارات المعمارية

قبل الكتابة تم تحديد النقاط التالية:

- **الموقع Front-End بالكامل** (بدون سيرفر خاص بك)، لذلك الحل العملي والآمن
  للربط بـ Google Sheets هو **Google Apps Script كـ Web App API** (كما طلبت
  في القسم السابع) — لا حاجة لأي API Key داخل الكود.
- **"كوّن بوكسك بنفسك"** لا يحتاج فعليًا Backend حقيقي في هذه المرحلة —
  الحساب والمنطق كله يمكن أن يتم في المتصفح. لذلك تم تنفيذه بالكامل بـ
  Frontend شغّال 100%، مع تعليق واضح داخل `js/build-box.js` يشرح كيف
  تربطه لاحقًا بمخزون/Backend حقيقي.
- **إدارة الأوزان المتعددة (250g/500g/1kg):** الشيت المطلوب في البند السادس
  يخزّن **وزن واحد وسعر واحد لكل صف منتج**. لحل هذا التعارض دون تعقيد
  الشيت، الموقع يعرض ثلاث خيارات وزن مشتقة تلقائيًا من الوزن/السعر
  الأساسي للمنتج (نصف / كامل / ضعف). إذا أردت أسعارًا مخصصة تمامًا لكل
  وزن، الحل الأدق هو إضافة صف منفصل لكل وزن بنفس الاسم — الكود يدعم ذلك
  دون أي تعديل إضافي.
- **الدفع الإلكتروني:** تم تنفيذ "الدفع عند الاستلام" فقط كما طلبت، مع ترك
  خيار "الدفع الإلكتروني" ظاهرًا كـ Placeholder معطّل وجاهز للتفعيل لاحقًا.
- **GitHub Pages:** الموقع بالكامل Static ويعمل مباشرة على GitHub Pages.
  الجزء الوحيد الذي **لا يمكن** أن يعمل من داخل GitHub Pages نفسه هو تخزين
  البيانات (Google Sheets + Apps Script يعملان من طرف Google، وهذا مقصود
  ومطلوب في البريف).

## 2) هيكل المشروع

```
infinity-store/
├── index.html / products.html / product.html / categories.html
├── cart.html / checkout.html / favorites.html
├── about.html / contact.html / build-box.html
├── css/ (style.css, responsive.css, animations.css)
├── js/  (config, products, cart, favorites, search, filters,
│         checkout, build-box, components, app)
├── api/google-apps-script.gs
├── assets/ (images, icons, logo — ضع اللوجو الحقيقي هنا)
├── sitemap.xml, robots.txt
└── README.md
```

كل صفحة تحمّل ملفات JS المشتركة (`config.js`, `products.js`, `cart.js`,
`favorites.js`, `search.js`, `components.js`) بالإضافة لملفها الخاص فقط
(`filters.js` في المنتجات، `checkout.js` في الدفع، `build-box.js` في صفحة
البوكس). هذا يمنع تكرار الكود وتضخم كل صفحة بسكريبتات لا تحتاجها.

---

## 3) إعداد Google Sheets خطوة بخطوة

### أ) إنشاء الشيت
1. افتح [sheets.google.com](https://sheets.google.com) وأنشئ Spreadsheet جديد.
2. سمّه مثلًا: **INFINITY Store Data**.
3. أنشئ 4 تبويبات (Sheets) بأسماء **مطابقة تمامًا** لهذه الأسماء:
   - `Products`
   - `Categories`
   - `Settings`
   - `Reviews`

### ب) أعمدة تبويب Products (بالترتيب في الصف الأول)
```
id | name | name_ar | category | subcategory | description | short_description |
image | image2 | image3 | price | old_price | discount | unit | weight |
available | stock | featured | best_seller | new_product | offer | rating |
reviews | tags
```
- `available`, `featured`, `best_seller`, `new_product`, `offer` → اكتب
  `true` أو `false` فقط.
- `tags` → كلمات مفصولة بفاصلة، مثال: `فستق,مكسرات,فاخر,هدايا` (استخدم
  كلمات المناسبات هنا مثل `عيد ميلاد` أو `خطوبة` ليظهر المنتج في صفحة
  "اختار هديتك حسب المناسبة").
- `image/image2/image3` → روابط صور مباشرة (انتهي بـ .jpg/.png أو رابط
  Unsplash/Imgur/رابط استضافة صورك). **لا تستخدم رابط صفحة Google Drive
  العادي** لأنه لا يعمل كصورة مباشرة — استخدم رابط استضافة صور حقيقي.

### ج) أعمدة تبويب Categories
```
id | name_ar | description | image
```
`id` يجب أن يطابق قيمة `category` المستخدمة في تبويب Products (مثال:
`nuts`, `chocolate`, `candy`, `snacks`, `sweets`, `derivatives`, `gift-boxes`).

### د) أعمدة تبويب Reviews
```
id | customer_name | rating | comment | image | approved | date
```
فقط الصفوف التي `approved = true` تظهر في الموقع.

### هـ) تبويب Settings (مختلف — عمودين فقط: مفتاح / قيمة)
في `Settings` الصف الأول اكتب `key` في A1 و`value` في B1، ثم أضف صفًا لكل
إعداد بهذا الترتيب:

| key | value |
|---|---|
| brand_name | INFINITY |
| brand_name_ar | انفنتي |
| logo | (رابط اللوجو) |
| favicon | (رابط الأيقونة) |
| whatsapp | 201000000000 |
| phone | 01000000000 |
| facebook | https://facebook.com/... |
| instagram | https://instagram.com/... |
| tiktok | https://tiktok.com/... |
| address | القاهرة، مصر |
| opening_hours | يوميًا من 10 صباحًا حتى 12 منتصف الليل |
| hero_title | لحظتك... بطعم لا يُنسى |
| hero_description | مكسرات، شوكولاتة، كاندي وهدايا مختارة بعناية من انفنتي |
| hero_image | (رابط صورة) |
| about_title | حكاية انفنتي |
| about_text | (النص الكامل) |
| about_image | (رابط صورة) |
| stat_products | 100 |
| stat_customers | 1000 |
| stat_boxes | 50 |
| free_shipping_limit | 500 |
| currency | EGP |
| footer_text | انفنتي... عالم من المكسرات والشوكولاتة والكاندي والهدايا. |

> ⚠️ رقم الواتساب يُكتب بصيغة دولية بدون علامة + وبدون صفر البداية،
> مثال مصر: `201001234567`.

---

## 4) نشر Google Apps Script كـ Web App

1. من داخل الـ Google Sheet نفسه: **الإضافات (Extensions) → Apps Script**.
2. احذف أي كود موجود، والصق محتوى ملف `api/google-apps-script.gs` بالكامل.
3. في أعلى الملف، استبدل السطر:
   ```js
   const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
   ```
   بمعرّف الشيت الخاص بك، وهو الجزء بين `/d/` و `/edit` في رابط الشيت:
   ```
   https://docs.google.com/spreadsheets/d/  1AbCdEfG...XyZ  /edit
   ```
4. اضغط **Deploy → New deployment**.
5. اختر نوع **Web app**.
6. الإعدادات:
   - **Execute as:** Me (حسابك)
   - **Who has access:** Anyone (حتى يقدر الموقع يقرأ البيانات بدون تسجيل دخول)
7. اضغط **Deploy**، ووافق على الصلاحيات المطلوبة (سيطلب منك مرة واحدة فقط).
8. انسخ الرابط الناتج (**Web app URL**) — يكون شكله:
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```

### أين تضع الرابط في المشروع؟
افتح `js/config.js` وضع الرابط هنا:
```js
WEB_APP_URL: "https://script.google.com/macros/s/AKfycbw.../exec",
```
بعد حفظ هذا التغيير، كل الصفحات ستقرأ المنتجات والتصنيفات والعروض
والإعدادات والتقييمات من الشيت مباشرة. **قبل وضع الرابط، الموقع يعمل تلقائيًا
ببيانات تجريبية (Demo Data) مدمجة في `js/products.js`** حتى لا تشاهد صفحة
فارغة أو معطوبة.

> كل مرة تعدّل فيها كود الـ Apps Script، تحتاج عمل **Deploy → Manage
> deployments → تعديل (Edit) → إصدار جديد (New version) → Deploy** حتى
> يعتمد Web App الرابط الجديد.

---

## 5) عمليات الإدارة اليومية (بدون لمس الكود)

| المطلوب | الخطوات |
|---|---|
| **إضافة منتج جديد** | أضف صفًا جديدًا في `Products` بنفس ترتيب الأعمدة، وأعطه `id` غير مكرر. |
| **تغيير سعر منتج** | عدّل الخلية في عمود `price` لهذا المنتج مباشرة. |
| **إيقاف منتج مؤقتًا** | غيّر `available` إلى `false` — سيظهر تلقائيًا "غير متوفر حاليًا" ولن يمكن إضافته للسلة. |
| **جعل منتج Best Seller** | غيّر `best_seller` إلى `true`. |
| **عمل عرض على منتج** | ضع `old_price` أعلى من `price`، وغيّر `offer` إلى `true`. نسبة الخصم تُحسب تلقائيًا. |
| **إضافة صورة** | الصق رابط صورة مباشر في `image` (و`image2`/`image3` لصور إضافية). |
| **إضافة Review** | أضف صفًا في `Reviews` مع `approved = true` ليظهر في السلايدر. |
| **تغيير رقم واتساب** | عدّل قيمة `whatsapp` في تبويب `Settings` فقط — يتحدث في كل الموقع تلقائيًا. |
| **تغيير صورة/نص الهيرو** | عدّل `hero_title`, `hero_description`, `hero_image` في `Settings`. |

بعد أي تعديل في الشيت، التغييرات تظهر على الموقع خلال دقائق قليلة (الموقع
يحتفظ بنسخة مؤقتة من البيانات لمدة 5 دقائق لتقليل الحمل على Apps Script —
يمكن تغيير هذه المدة من `CACHE_TTL` في `js/config.js`).

---

## 6) النشر على GitHub Pages

1. أنشئ Repository جديد على GitHub، مثلًا باسم `infinity-store`.
2. ارفع كل محتويات مجلد `infinity-store/` إلى الـ Repository (تأكد أن
   `index.html` في المسار الرئيسي وليس داخل مجلد فرعي).
3. من إعدادات الـ Repository: **Settings → Pages**.
4. تحت **Source** اختر **Deploy from a branch**، ثم اختر الفرع `main`
   والمجلد `/ (root)`.
5. احفظ، وانتظر دقيقة إلى دقيقتين — سيظهر رابط الموقع أعلى الصفحة بصيغة:
   ```
   https://username.github.io/infinity-store/
   ```
6. عدّل قيمة `og:url`/`canonical`/`sitemap.xml` لتستخدم هذا الرابط بدلًا
   من `example.com`.

**ملاحظة مهمة:** GitHub Pages يستضيف ملفات HTML/CSS/JS فقط (Static)، وهذا
يتطابق تمامًا مع طبيعة هذا المشروع. مصدر البيانات (Google Sheets +
Apps Script) يعمل من طرف Google بشكل منفصل تمامًا ولا يحتاج أي استضافة
إضافية — لذلك لا يوجد أي جزء من الموقع لن يعمل على GitHub Pages.

---

## 7) استبدال اللوجو الحقيقي

اللوجو الحالي عبارة عن دائرة بحرف "I" (`.brand__mark` في `components.js`)
لسهولة الاستبدال. لوضع لوجو حقيقي:
1. ضع ملف اللوجو في `assets/logo/logo.png`.
2. في `js/components.js`، استبدل:
   ```html
   <span class="brand__mark">I</span>
   ```
   بـ:
   ```html
   <img src="assets/logo/logo.png" alt="INFINITY" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
   ```
   (يظهر هذا السطر مرتين: مرة في الهيدر ومرة في الفوتر).

---

## 8) نقاط تقنية مهمة

- **الأداء:** لا يوجد أي Framework — Vanilla JS فقط. الصور تستخدم
  `loading="lazy"`. البيانات تُخزَّن مؤقتًا (Cache) في المتصفح لتقليل عدد
  الطلبات لـ Apps Script.
- **الأمان:** لا يوجد أي API Key أو بيانات حساسة داخل الكود. Web App
  المنشور من Apps Script للقراءة فقط (GET) ولا يمكنه تعديل الشيت.
- **حالة الفشل:** لو تعذّر الوصول لـ Google Sheets لأي سبب، تظهر رسالة
  "تعذر تحميل المنتجات حاليًا، يرجى المحاولة مرة أخرى." بدلًا من انهيار
  الصفحة، وتُستخدم بيانات Demo كخط دفاع أخير.
- **RTL/عربي بالكامل:** `dir="rtl"` و`lang="ar"` على مستوى `<html>` في كل
  صفحة. لإضافة دعم الإنجليزية لاحقًا، أنسب طريقة هي تكرار كل صفحة داخل
  مجلد `/en/` بنفس أسماء الملفات مع `dir="ltr"` و`lang="en"`، وقراءة نصوص
  الواجهة من كائن ترجمة بسيط بدلاً من كتابتها inline — البنية الحالية
  للـ JS (بيانات منفصلة عن العرض) تسمح بهذا دون إعادة هيكلة.
- **إمكانية الوصول (Accessibility):** alt text على كل الصور، aria-label
  على الأزرار الأيقونية، focus states واضحة (`:focus-visible`)، وتباين
  ألوان متوافق مع WCAG AA على النصوص الأساسية.

---

## 9) التطوير المستقبلي (كما طلب البريف أن يكون قابلًا للتوسع)

- **حسابات العملاء وتتبع الطلبات:** يحتاج قاعدة بيانات + مصادقة حقيقية
  (Firebase أو Backend مخصص) — البنية الحالية (`DataStore` في
  `products.js`) مصممة بحيث يمكن استبدال مصدر البيانات دون تغيير أي كود
  في الصفحات نفسها.
- **مخزون حقيقي متزامن مع الطلبات:** يتطلب أن يقوم Apps Script أيضًا
  بالكتابة (وليس القراءة فقط) عند كل طلب، مع تحقق من التوكن لمنع إساءة
  الاستخدام.
- **الدفع الإلكتروني:** إضافة مزود دفع مصري (مثل Paymob/Fawry) يتطلب
  Backend للتعامل الآمن مع مفاتيح الدفع — لا يجب أبدًا وضعها في Frontend.
