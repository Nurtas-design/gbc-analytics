const SUPABASE_URL = "https://hxwsdrhimzychzhavajb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4d3NkcmhpbXp5Y2h6aGF2YWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTU0NDMsImV4cCI6MjA5MTYzMTQ0M30.tdwzAWqb5AeQuaOkh2KmnlWtAaEgUZSErZv9o_oyFyw";

const T = {
  kk: {
    headerSub: "Nova Collection • Аналитика",
    pageH2: "Заказдар Дашборды",
    pageSub: "RetailCRM → Supabase • Нақты уақыттағы деректер",
    live: "Тікелей",
    lblOrders: "Жалпы заказ", subOrders: "RetailCRM-дан",
    lblRevenue: "Жалпы айналым", subRevenue: "барлық заказ",
    lblAvg: "Орташа чек", subAvg: "заказ басына",
    lblBig: "VIP заказдар", subBig: "50 000 ₸ жоғары",
    cityTitle: "Қалалар бойынша заказдар",
    utmTitle: "Трафик көзі",
    priceTitle: "Сомалар бойынша бөліну",
    revenueTitle: "UTM бойынша айналым",
    tableTitle: "Соңғы заказдар",
    thName: "Аты-жөні", thCity: "Қала", thAmount: "Сомасы", thUtm: "Трафик", thStatus: "Статус",
    badgeCity: "Саны", badgeUtm: "UTM", badgeRevenue: "₸", badgeTable: "Top 10",
    statusNew: "Жаңа",
    orderBtn: "Тапсырыс беру"
  },
  ru: {
    headerSub: "Nova Collection • Аналитика",
    pageH2: "Дашборд Заказов",
    pageSub: "RetailCRM → Supabase • Данные в реальном времени",
    live: "В эфире",
    lblOrders: "Всего заказов", subOrders: "из RetailCRM",
    lblRevenue: "Общий оборот", subRevenue: "все заказы",
    lblAvg: "Средний чек", subAvg: "на заказ",
    lblBig: "VIP заказы", subBig: "свыше 50 000 ₸",
    cityTitle: "Заказы по городам",
    utmTitle: "Источник трафика",
    priceTitle: "Распределение по суммам",
    revenueTitle: "Оборот по UTM",
    tableTitle: "Последние заказы",
    thName: "Имя", thCity: "Город", thAmount: "Сумма", thUtm: "Трафик", thStatus: "Статус",
    badgeCity: "Кол-во", badgeUtm: "UTM", badgeRevenue: "₸", badgeTable: "Top 10",
    statusNew: "Новый",
    orderBtn: "Новый заказ"
  },
  en: {
    headerSub: "Nova Collection • Analytics",
    pageH2: "Orders Dashboard",
    pageSub: "RetailCRM → Supabase • Real-time data",
    live: "Live",
    lblOrders: "Total Orders", subOrders: "from RetailCRM",
    lblRevenue: "Total Revenue", subRevenue: "all orders",
    lblAvg: "Average Order", subAvg: "per order",
    lblBig: "VIP Orders", subBig: "above 50 000 ₸",
    cityTitle: "Orders by City",
    utmTitle: "Traffic Source",
    priceTitle: "Price Distribution",
    revenueTitle: "Revenue by UTM",
    tableTitle: "Recent Orders",
    thName: "Name", thCity: "City", thAmount: "Amount", thUtm: "Traffic", thStatus: "Status",
    badgeCity: "Count", badgeUtm: "UTM", badgeRevenue: "₸", badgeTable: "Top 10",
    statusNew: "New",
    orderBtn: "Place Order"
  }
};

let currentLang = "kk";
let allOrders = [];
let charts = {};

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`);
  if (activeBtn) activeBtn.classList.add("active");
  applyTranslations();
  if (allOrders.length) renderTable(allOrders);
}

function applyTranslations() {
  const t = T[currentLang];
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("header-sub", t.headerSub);
  set("page-h2", t.pageH2);
  set("page-sub", t.pageSub);
  set("live-text", t.live);
  set("lbl-orders", t.lblOrders);
  set("sub-orders", t.subOrders);
  set("lbl-revenue", t.lblRevenue);
  set("sub-revenue", t.subRevenue);
  set("lbl-avg", t.lblAvg);
  set("sub-avg", t.subAvg);
  set("lbl-big", t.lblBig);
  set("sub-big", t.subBig);
  set("chart-city-title", t.cityTitle);
  set("chart-utm-title", t.utmTitle);
  set("chart-price-title", t.priceTitle);
  set("chart-revenue-title", t.revenueTitle);
  set("table-title", t.tableTitle);
  set("th-name", t.thName);
  set("th-city", t.thCity);
  set("th-amount", t.thAmount);
  set("th-utm", t.thUtm);
  set("th-status", t.thStatus);
  set("badge-city", t.badgeCity);
  set("badge-utm", t.badgeUtm);
  set("badge-revenue", t.badgeRevenue);
  set("badge-table", t.badgeTable);
  // FIX: order button text in header
  set("order-btn-text", t.orderBtn);
}

async function fetchOrders() {
  const url = `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function fmt(value) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₸";
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const groupKey = item[key] || "—";
    acc[groupKey] = (acc[groupKey] || 0) + 1;
    return acc;
  }, {});
}

function animateCounter(el, target, isPrice = false) {
  let start = 0;
  const duration = 1200;
  const tick = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = isPrice ? fmt(current) : String(current);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const COLORS = ["#7c6af7", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#fb923c"];

function buildChart(id, type, labels, data, extraOptions = {}) {
  if (charts[id]) charts[id].destroy();

  const ctx = document.getElementById(id);
  if (!ctx) return;

  charts[id] = new Chart(ctx.getContext("2d"), {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: type === "doughnut" ? COLORS : COLORS.map((c) => c + "cc"),
        borderWidth: 0,
        borderRadius: type === "doughnut" ? 0 : 10,
        hoverOffset: type === "doughnut" ? 8 : 0
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: {
        legend: {
          display: type === "doughnut",
          position: "bottom",
          labels: { color: "#6b7594", font: { family: "Inter", size: 12 } }
        }
      },
      scales: type === "doughnut" ? undefined : {
        x: {
          ticks: { color: "#6b7594", font: { family: "Inter", size: 12 } },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "#6b7594", font: { family: "Inter", size: 12 } },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      },
      ...extraOptions
    }
  });
}

function renderCharts(orders) {
  // City chart
  const cityMap = groupBy(orders, "city");
  const citySorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
  buildChart("cityChart", "bar", citySorted.map((x) => x[0]), citySorted.map((x) => x[1]));

  // UTM donut
  const utmMap = groupBy(orders, "utm_source");
  buildChart("utmChart", "doughnut", Object.keys(utmMap), Object.values(utmMap));

  // Price distribution
  const ranges = { "<15k": 0, "15-30k": 0, "30-50k": 0, "50-80k": 0, "80k+": 0 };
  orders.forEach((o) => {
    const p = o.total_price || 0;
    if (p < 15000) ranges["<15k"]++;
    else if (p < 30000) ranges["15-30k"]++;
    else if (p < 50000) ranges["30-50k"]++;
    else if (p < 80000) ranges["50-80k"]++;
    else ranges["80k+"]++;
  });
  buildChart("priceChart", "bar", Object.keys(ranges), Object.values(ranges));

  // Revenue by UTM
  const rev = {};
  orders.forEach((o) => {
    const source = o.utm_source || "direct";
    rev[source] = (rev[source] || 0) + (o.total_price || 0);
  });
  const revSorted = Object.entries(rev).sort((a, b) => b[1] - a[1]);
  buildChart(
    "revenueChart",
    "bar",
    revSorted.map((x) => x[0]),
    revSorted.map((x) => Math.round(x[1] / 1000)),
    {
      indexAxis: "y",
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw}k ₸`
          }
        }
      }
    }
  );
}

function renderTable(orders) {
  const t = T[currentLang];
  const utmColor = {
    instagram: "#e1306c",
    google: "#4285f4",
    tiktok: "#010101",
    direct: "#6b7594",
    referral: "#34d399"
  };

  const tbody = document.getElementById("orders-table");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted)">Деректер жоқ</td></tr>`;
    return;
  }

  const rows = orders.slice(0, 10).map((o, i) => {
    const total = o.total_price || 0;
    const amountClass = total >= 80000 ? "amount-high" : total >= 50000 ? "amount-mid" : "";
    const city = o.city || "—";
    const utm = o.utm_source || "direct";
    const color = utmColor[utm] || "var(--muted)";
    const name = `${o.first_name || ""} ${o.last_name || ""}`.trim() || "—";

    return `
      <tr>
        <td style="color:var(--muted);font-size:12px">#${i + 1}</td>
        <td><strong style="color:var(--text)">${name}</strong></td>
        <td><span class="city-badge">${city}</span></td>
        <td class="amount-cell ${amountClass}">${fmt(total)}</td>
        <td><span class="utm-tag" style="color:${color}">● ${utm}</span></td>
        <td><span style="padding:3px 10px;border-radius:20px;font-size:11px;background:rgba(124,106,247,0.15);color:var(--accent1);border:1px solid rgba(124,106,247,0.2)">${t.statusNew}</span></td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;
}

async function init() {
  applyTranslations();
  try {
    allOrders = await fetchOrders();

    const total = allOrders.length;
    const revenue = allOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const avg = total > 0 ? revenue / total : 0;
    const big = allOrders.filter((o) => (o.total_price || 0) >= 50000).length;

    animateCounter(document.getElementById("val-orders"), total);
    setTimeout(() => animateCounter(document.getElementById("val-revenue"), revenue, true), 150);
    setTimeout(() => animateCounter(document.getElementById("val-avg"), avg, true), 300);
    setTimeout(() => animateCounter(document.getElementById("val-big"), big), 450);

    renderCharts(allOrders);
    renderTable(allOrders);
  } catch (error) {
    console.error("Dashboard error:", error);
    const grid = document.getElementById("kpi-grid");
    if (grid) {
      grid.innerHTML = `<div style="color:#ef4444;padding:20px;grid-column:1/-1">⚠️ Supabase байланысын тексер: ${error.message}</div>`;
    }
  }
}

init();