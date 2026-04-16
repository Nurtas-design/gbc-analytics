const SUPABASE_URL = "https://hxwsdrhimzychzhavajb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4d3NkcmhpbXp5Y2h6aGF2YWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTU0NDMsImV4cCI6MjA5MTYzMTQ0M30.tdwzAWqb5AeQuaOkh2KmnlWtAaEgUZSErZv9o_oyFyw";

const T = {
  kk: {
    badge: "Nova Collection",
    title: "Тапсырыс беру",
    sub: "Деректеріңізді толтырыңыз, менеджер хабарласады",
    secContact: "Байланыс деректері",
    secItems: "Тауарлар",
    fname: "Аты", lname: "Тегі", phone: "Телефон", city: "Қала",
    itemName: "Тауар атауы", qty: "Саны", price: "Бағасы (₸)",
    addItem: "+ Тауар қосу",
    total: "Жалпы сомасы",
    submit: "Тапсырыс беру",
    loading: "Жіберілуде...",
    sucTitle: "Тапсырыс қабылданды!",
    sucSub: "Менеджер жақын арада хабарласады",
    sucBtn: "Жаңа тапсырыс",
    cityPlaceholder: "— таңдаңыз —",
    itemPlaceholder: "Мысалы: Жайма",
    errRequired: "Міндетті өріс",
    errPhone: "Телефон нөмірін дұрыс енгізіңіз",
    errItems: "Кемінде 1 тауар қосыңыз",
    errItemName: "Тауар атауын енгізіңіз",
    errPrice: "Бағасын енгізіңіз",
  },
  ru: {
    badge: "Nova Collection",
    title: "Оформить заказ",
    sub: "Заполните данные, менеджер свяжется с вами",
    secContact: "Контактные данные",
    secItems: "Товары",
    fname: "Имя", lname: "Фамилия", phone: "Телефон", city: "Город",
    itemName: "Название товара", qty: "Кол-во", price: "Цена (₸)",
    addItem: "+ Добавить товар",
    total: "Итого",
    submit: "Оформить заказ",
    loading: "Отправляем...",
    sucTitle: "Заказ принят!",
    sucSub: "Менеджер свяжется с вами в ближайшее время",
    sucBtn: "Новый заказ",
    cityPlaceholder: "— выберите —",
    itemPlaceholder: "Например: Жайма",
    errRequired: "Обязательное поле",
    errPhone: "Введите корректный номер",
    errItems: "Добавьте хотя бы 1 товар",
    errItemName: "Введите название товара",
    errPrice: "Введите цену",
  },
  en: {
    badge: "Nova Collection",
    title: "Place an Order",
    sub: "Fill in your details, a manager will contact you",
    secContact: "Contact Details",
    secItems: "Items",
    fname: "First Name", lname: "Last Name", phone: "Phone", city: "City",
    itemName: "Product Name", qty: "Qty", price: "Price (₸)",
    addItem: "+ Add Item",
    total: "Total",
    submit: "Place Order",
    loading: "Sending...",
    sucTitle: "Order Received!",
    sucSub: "A manager will contact you shortly",
    sucBtn: "New Order",
    cityPlaceholder: "— select —",
    itemPlaceholder: "E.g. Jayma",
    errRequired: "Required field",
    errPhone: "Enter a valid phone number",
    errItems: "Add at least 1 item",
    errItemName: "Enter product name",
    errPrice: "Enter price",
  }
};

let lang = "kk";
let itemCount = 0;

function setLang(l) {
  lang = l;
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.lang-btn[onclick="setLang('${l}')"]`).classList.add("active");
  applyTranslations();
}

function applyTranslations() {
  const t = T[lang];
  document.getElementById("lbl-badge").textContent = t.badge;
  document.getElementById("lbl-title").textContent = t.title;
  document.getElementById("lbl-sub").textContent = t.sub;
  document.getElementById("lbl-section-contact").textContent = t.secContact;
  document.getElementById("lbl-section-items").textContent = t.secItems;
  document.getElementById("lbl-fname").textContent = t.fname;
  document.getElementById("lbl-lname").textContent = t.lname;
  document.getElementById("lbl-phone").textContent = t.phone;
  document.getElementById("lbl-email").textContent = "Email";
  document.getElementById("lbl-city").textContent = t.city;
  document.getElementById("btn-add-item").textContent = t.addItem;
  document.getElementById("lbl-total").textContent = t.total;
  document.getElementById("submit-text").textContent = t.submit;
  document.getElementById("inp-city").options[0].text = t.cityPlaceholder;
  document.getElementById("suc-title").textContent = t.sucTitle;
  document.getElementById("suc-sub").textContent = t.sucSub;
  document.getElementById("suc-btn").textContent = t.sucBtn;
  // update item placeholders
  document.querySelectorAll(".item-name-input").forEach(inp => inp.placeholder = t.itemPlaceholder);
  document.querySelectorAll(".item-label-name").forEach(el => el.textContent = t.itemName);
  document.querySelectorAll(".item-label-qty").forEach(el => el.textContent = t.qty);
  document.querySelectorAll(".item-label-price").forEach(el => el.textContent = t.price);
}

function addItem() {
  const t = T[lang];
  const id = ++itemCount;
  const container = document.getElementById("items-container");
  const div = document.createElement("div");
  div.className = "item-row";
  div.id = `item-${id}`;
  div.innerHTML = `
    <div class="field">
      <label class="item-label-name">${t.itemName}</label>
      <input class="item-name-input" type="text" placeholder="${t.itemPlaceholder}" oninput="calcTotal()"/>
    </div>
    <div class="field">
      <label class="item-label-qty">${t.qty}</label>
      <input type="number" min="1" value="1" oninput="calcTotal()"/>
    </div>
    <div class="field">
      <label class="item-label-price">${t.price}</label>
      <input type="number" min="0" placeholder="0" oninput="calcTotal()"/>
    </div>
    <button class="remove-btn" onclick="removeItem(${id})" title="Жою">×</button>
  `;
  container.appendChild(div);
  calcTotal();
}

function removeItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (el) { el.remove(); calcTotal(); }
}

function calcTotal() {
  let total = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    const inputs = row.querySelectorAll("input[type=number]");
    const qty = parseFloat(inputs[0]?.value) || 0;
    const price = parseFloat(inputs[1]?.value) || 0;
    total += qty * price;
  });
  document.getElementById("total-display").textContent =
    new Intl.NumberFormat("ru-RU").format(Math.round(total)) + " ₸";
  return total;
}

function formatPhone(input) {
  let val = input.value.replace(/\D/g, "");
  if (val.startsWith("8")) val = "7" + val.slice(1);
  if (!val.startsWith("7")) val = "7" + val;
  val = val.slice(0, 11);
  let result = "+7";
  if (val.length > 1) result += " " + val.slice(1, 4);
  if (val.length > 4) result += " " + val.slice(4, 7);
  if (val.length > 7) result += " " + val.slice(7, 9);
  if (val.length > 9) result += " " + val.slice(9, 11);
  input.value = result;
}

function phoneKeydown(e, input) {
  if (e.key === "Backspace") {
    const val = input.value;
    if (val === "+7 " || val === "+7") {
      e.preventDefault();
      input.value = "+7 ";
    }
  }
}

function normalizeSource(raw) {
  const value = (raw || "").toLowerCase().trim();
  if (!value) return "";

  if (["ig", "inst", "instagram"].includes(value)) return "instagram";
  if (["tg", "telegram", "t.me"].includes(value)) return "telegram";
  if (["tt", "tiktok"].includes(value)) return "tiktok";
  if (["wa", "whatsapp"].includes(value)) return "whatsapp";
  if (["google", "googleads", "adwords"].includes(value)) return "google";
  if (["fb", "facebook"].includes(value)) return "facebook";
  if (["yt", "youtube"].includes(value)) return "youtube";
  if (value === "direct") return "direct";
  
  // Белгісіз мәнді "referral" деп өзгертпей, нақты мәнін қайтар
  return value;
}

function sourceFromReferrer() {
  const ref = (document.referrer || "").toLowerCase();
  if (!ref) return "";
  
  try {
    const hostname = new URL(document.referrer).hostname.replace("www.", "");
    
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("t.me") || hostname.includes("telegram.org") || hostname.includes("telegram.me")) return "telegram";
    if (hostname.includes("tiktok.com")) return "tiktok";
    if (hostname.includes("wa.me") || hostname.includes("whatsapp.com")) return "whatsapp";
    if (hostname.includes("google.")) return "google";
    if (hostname.includes("facebook.com") || hostname.includes("fb.com")) return "facebook";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("2gis.")) return "2gis";
    
    // Нақты hostname-ді қайтар (мысалы: "olx.kz", "krisha.kz")
    return hostname;
  } catch {
    return "referral";
  }
}

function getUTM() {
  const p = new URLSearchParams(location.search);
  const sourceCandidate =
    p.get("utm_source") ||
    p.get("source") ||
    p.get("src") ||
    p.get("from");

  const fromURL = normalizeSource(sourceCandidate);
  if (fromURL) {
    localStorage.setItem("utm_source", fromURL);
    return fromURL;
  }

  const fromReferrer = sourceFromReferrer();
  if (fromReferrer) {
    localStorage.setItem("utm_source", fromReferrer);
    return fromReferrer;
  }

  const fromStorage = normalizeSource(localStorage.getItem("utm_source"));
  if (fromStorage) return fromStorage;

  return "direct";
}

function validate() {
  const t = T[lang];
  let ok = true;

  function check(fieldId, inputId, condition, msg) {
    const f = document.getElementById(fieldId);
    const inp = document.getElementById(inputId);
    if (!condition) {
      f.classList.add("has-error");
      inp.classList.add("error");
      document.getElementById("err-" + inputId.replace("inp-","")).textContent = msg;
      ok = false;
    } else {
      f.classList.remove("has-error");
      inp.classList.remove("error");
    }
  }

  const fname = document.getElementById("inp-fname").value.trim();
  const lname = document.getElementById("inp-lname").value.trim();
  const phone = document.getElementById("inp-phone").value.trim();
  const city = document.getElementById("inp-city").value;

  check("f-fname","inp-fname", fname.length >= 2, t.errRequired);
  check("f-lname","inp-lname", lname.length >= 2, t.errRequired);
  check("f-phone","inp-phone", phone.length >= 7, t.errPhone);
  check("f-city","inp-city", city !== "", t.errRequired);

  const items = document.querySelectorAll(".item-row");
  if (!items.length) { alert(t.errItems); ok = false; }

  return ok;
}

async function submitOrder() {
  if (!validate()) return;

  const t = T[lang];
  const btn = document.getElementById("submit-btn");
  const txt = document.getElementById("submit-text");

  btn.disabled = true;
  txt.innerHTML = `<span class="spinner"></span>${t.loading}`;

  const items = [];
  let total = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    const name = row.querySelector(".item-name-input").value.trim();
    const inputs = row.querySelectorAll("input[type=number]");
    const qty = parseFloat(inputs[0]?.value) || 1;
    const price = parseFloat(inputs[1]?.value) || 0;
    items.push({ name, qty, price });
    total += qty * price;
  });

  const row = {
    crm_id: "form-" + Date.now(),
    first_name: document.getElementById("inp-fname").value.trim(),
    last_name: document.getElementById("inp-lname").value.trim(),
    phone: document.getElementById("inp-phone").value.trim(),
    email: document.getElementById("inp-email").value.trim(),
    status: "new",
    total_price: Math.round(total),
    city: document.getElementById("inp-city").value,
    utm_source: getUTM(),
    items_count: items.length,
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) throw new Error(await res.text());

    document.getElementById("suc-amount").textContent =
      new Intl.NumberFormat("ru-RU").format(Math.round(total)) + " ₸";
    document.getElementById("success-overlay").classList.add("show");

  } catch (err) {
    alert("Қате: " + err.message);
    btn.disabled = false;
    txt.textContent = t.submit;
  }
}


// UTM Link Generator
function showUTMPanel() {
  const base = location.origin + location.pathname;
  const links = [
    { label: "Instagram", source: "instagram", emoji: "📸" },
    { label: "Telegram",  source: "telegram",  emoji: "✈️" },
    { label: "TikTok",    source: "tiktok",    emoji: "🎵" },
    { label: "WhatsApp",  source: "whatsapp",  emoji: "💬" },
    { label: "2GIS",      source: "2gis",      emoji: "🗺️" },
  ];

  const existing = document.getElementById("utm-panel");
  if (existing) { existing.remove(); return; }

  const panel = document.createElement("div");
  panel.id = "utm-panel";
  panel.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:999;
    background:#0d1117; border:1px solid rgba(255,255,255,0.1);
    border-radius:16px; padding:20px; width:300px;
    box-shadow:0 20px 60px rgba(0,0,0,0.6);
    font-family:'DM Sans',sans-serif;
  `;

  panel.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:14px;">
      🔗 UTM Сілтемелер
    </div>
    ${links.map(l => `
      <div style="margin-bottom:8px;">
        <div style="font-size:11px;color:#6b7594;margin-bottom:4px;">${l.emoji} ${l.label}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <input readonly value="${base}?utm_source=${l.source}"
            style="flex:1;background:#161b27;border:1px solid rgba(255,255,255,0.07);
            border-radius:8px;padding:7px 10px;color:#f0f4ff;font-size:11px;outline:none;"/>
          <button onclick="
            navigator.clipboard.writeText('${base}?utm_source=${l.source}');
            this.textContent='✓';
            setTimeout(()=>this.textContent='Copy',1500);
          " style="padding:7px 10px;background:linear-gradient(135deg,#7c6af7,#f472b6);
            border:none;border-radius:8px;color:#fff;font-size:11px;cursor:pointer;
            font-weight:600;white-space:nowrap;">Copy</button>
        </div>
      </div>
    `).join("")}
    <button onclick="document.getElementById('utm-panel').remove()"
      style="width:100%;margin-top:10px;padding:8px;background:transparent;
      border:1px solid rgba(255,255,255,0.07);border-radius:8px;
      color:#6b7594;font-size:12px;cursor:pointer;">Жабу</button>
  `;

  document.body.appendChild(panel);
}

// Init
getUTM(); // UTM-ді бірден localStorage-ке сақтайды
addItem();
applyTranslations();