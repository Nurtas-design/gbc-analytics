# GBC Analytics Dashboard

Nova Collection үшін нақты уақыттағы заказдар аналитикасы.

**RetailCRM → Supabase → Vercel Dashboard + Telegram Bot**

🔗 Dashboard: _деплой жасалғаннан кейін қосыңыз_

---

## Жоба құрылымы

```
gbc-analytics-dashboard/
├── index.html              # Негізгі дашборд (KPI + 4 диаграмма + кесте)
├── order.html              # Тапсырыс беру формасы
├── app.js                  # Дашборд логикасы (Supabase, Chart.js, i18n)
├── styles.css              # Dark theme стильдер
├── vercel.json             # Vercel route конфигурациясы
├── mock_orders.json        # 50 тест заказ
├── upload_to_retailcrm.py  # Шаг 2: mock_orders → RetailCRM API
├── sync_to_supabase.py     # Шаг 3: RetailCRM → Supabase синхронизация
└── telegram_bot.py         # Шаг 5: 50,000₸+ заказдарға Telegram хабарлама
```

---

## Қандай промпттар бердім

### Шаг 1 — Dashboard (index.html + app.js + styles.css)

Бірінші промпт өте жалпы болды, Claude аз нәрсе жасады:

> "дашборд жаса заказдар үшін"

Claude жай ғана бос HTML скелет жасады — деректер жоқ, стиль жоқ, логика жоқ. Нақтылауға тура келді:

> "index.html жаса. Supabase-тен заказдарды алу керек. KPI карточкалары: жалпы заказ саны, жалпы айналым, орташа чек, VIP заказдар (50к+). 4 диаграмма Chart.js арқылы: қалалар бойынша bar chart, utm_source doughnut, бағалар бойынша бөліну, UTM бойынша айналым horizontal bar. Соңғы 10 заказ кестесі. Dark theme. 3 тілде: қазақша, орысша, ағылшынша — тіл ауыстыру батырмалары болсын."

Осыдан кейін жұмыс істейтін нәрсе шықты.

---

### Шаг 2 — Тапсырыс беру формасы (order.html)

> "order.html жаса. Форма: аты, тегі, телефон, email, қала (select), тауарлар (динамикалық қосу/жою, атауы + саны + бағасы). Жалпы сомасы автоматты есептелсін. Supabase-ке POST жіберсін. Validation болсын. Сәтті жіберілсе overlay шықсын. Дизайн index.html-дегідей dark theme."

Бірінші нұсқада validation дұрыс жұмыс істемеді — телефон өрісі бос болса да форма жіберілетін. Айттым:

> "validation дұрыста, телефон мен қала бос болса submit болмасын, error message көрсетсін"

Түзетіп берді.

---

### Шаг 3 — mock_orders.json

Мұнда бірінші үлкен тосқауыл шықты. Репода `mock_orders.json` бар деп ойладым, ашып қарасам — ол файл `vercel.json` rewrites конфигурациясы болып шықты:

```json
{ "rewrites": [{ "source": "/order", "destination": "/order.html" }] }
```

Нақты заказдар жоқ екен, файл атауы алдады. Claude-ға айттым:

> "mock_orders.json жаса, 50 тест заказ болсын. Қазақстан қалалары: Алматы, Астана, Шымкент, Қарағанды, Атырау т.б. Нақты қазақ есімдері. utm_source: instagram, google, tiktok, direct, referral. Бағалар 15,000-тен 95,000-ға дейін. Кейбіреулері VIP (50,000+) болсын."

50 заказ жасады, бәрі дұрыс форматта.

---

### Шаг 4 — upload_to_retailcrm.py

> "Python скрипт жаз: mock_orders.json оқып RetailCRM API v5-ке жүктейді. endpoint: /api/v5/orders/create. firstName, lastName, phone, email, items (name, qty, price), delivery.address.city жіберілсін."

Іске қостым — жұмыс істеді, бірақ RetailCRM-де utm_source бос болып тұр. Себебі скрипт customFields жібермеген екен. Айттым:

> "customFields utm_source да жіберілсін, mock_orders.json-дағы customFields объектін тікелей order-ға қос"

Қостым, енді utm_source да дұрыс жүктеледі.

---

### Шаг 5 — sync_to_supabase.py

> "Python скрипт жаз: RetailCRM API v5-тен барлық заказдарды алып Supabase-ке сақтайды. Pagination болсын. Duplicate болмасын — crm_id бойынша upsert."

Скрипт жазды, бірінші рет іске қостым — жұмыс істеді. Бірақ екінші рет іске қосқанда барлық заказдар қайта жасалып жатыр, duplicate шығып жатыр. Supabase логтарын қарадым:

```
duplicate key value violates unique constraint "orders_crm_id_key"
```

Claude-ға айттым:

> "upsert жұмыс істемей жатыр, duplicate заказдар жасалып жатыр. Prefer header бар бірақ жұмыс істемейді"

Claude түсіндірді: Supabase upsert үшін `Prefer: resolution=merge-duplicates` жеткіліксіз, URL-де `?on_conflict=crm_id` параметрі де болуы керек. Екеуі бірге жұмыс істейді. Түзетті — одан кейін дұрыс upsert болды.

---

### Шаг 6 — telegram_bot.py

> "Telegram бот жаз. RetailCRM-де жаңа заказ пайда болса, сомасы 50,000-ден асса Telegram-ға хабарлама жіберсін. Хабарламада: клиент аты, телефон, қала, тауарлар тізімі, жалпы сома. Бот командалары: /start, /status, /lang. 3 тіл қолдауы. Меню батырмалары болсын."

Бот жазылды. Іске қостым — `/start` жұмыс істейді, меню шықты. Бірақ 2-3 минуттан кейін бот өліп қалды, terminal-де:

```
requests.exceptions.ReadTimeout: HTTPSConnectionPool read timed out
```

Claude-ға айттым:

> "бот ReadTimeout-пен өліп жатыр, getUpdates кезінде"

Claude түсіндірді: `requests.get` timeout 20 секунд деп қойылған, ал Telegram `getUpdates`-тің `timeout` параметрі де 20 секунд. Telegram 20 секунд күтіп жауап қайтарғанша, requests та дәл сол уақытта timeout болып кетеді. `requests` timeout Telegram timeout-тан кем дегенде 5 секунд артық болуы керек: Telegram `timeout=25`, requests `timeout=30`. Осыны түзеткен соң бот тұрақты жұмыс істеді.

---

### Шаг 7 — Тіл ауыстыру баги

Дашбордта тілді ауыстырғанда барлық мәтін аударылады, бірақ хедердегі "Тапсырыс беру" батырмасы ауыспай тұр. Байқадым — батырма тексті `T` объектіне кірмеген екен, жеке `ORDER_BTN_TEXTS` объектімен override жасалып, `index.html`-де артық `<script>` болған. Claude-ға айттым:

> "тіл ауыстырғанда header-дегі order батырмасы тексті де ауыспайды, дұрыста"

Claude `orderBtn` кілтін T объектіне қосып, `applyTranslations` функциясында өңдеді. Артық script жойылды.

---

## Тұрып қалған жерлер — жиынтық

| # | Проблема | Себебі | Шешімі |
|---|---------|--------|--------|
| 1 | `mock_orders.json` заказдар жоқ | Файл vercel config болып шықты | Жаңадан 50 заказ генерациялады |
| 2 | RetailCRM-де utm_source бос | `customFields` upload скриптіне қосылмаған | Скриптке `customFields` блогын қостым |
| 3 | Supabase уpsert duplicate жасады | URL-де `?on_conflict=crm_id` жоқ | Endpoint URL-ге параметр қосылды |
| 4 | Telegram бот ReadTimeout-пен өлді | `requests` timeout ≤ Telegram timeout | `requests timeout=30`, Telegram `timeout=25` |
| 5 | Order батырмасы аударылмады | `orderBtn` T объектінде жоқ | `applyTranslations`-қа қосылды |

---

## Іске қосу нұсқаулығы

### Supabase кестесін жасау

SQL Editor-да орындаңыз:

```sql
create table orders (
  id bigint generated always as identity primary key,
  crm_id text unique not null,
  first_name text,
  last_name text,
  phone text,
  email text,
  status text default 'new',
  total_price numeric default 0,
  city text,
  utm_source text default 'direct',
  items_count integer default 0,
  created_at timestamptz default now()
);

alter table orders enable row level security;
create policy "anon read" on orders for select using (true);
create policy "anon insert" on orders for insert with check (true);
```

### Скрипттерді іске қосу

```bash
pip install requests

# Шаг 2: mock_orders.json → RetailCRM
python upload_to_retailcrm.py

# Шаг 3: RetailCRM → Supabase
python sync_to_supabase.py

# Шаг 5: Telegram бот
python telegram_bot.py
```

### Vercel деплой

```bash
npm i -g vercel
vercel --prod
```

немесе GitHub → Vercel dashboard → "Import repository" — автоматты деплой болады.

---

## Байланыс

Нәтижені жіберу: **@DmitriyKrasnikov**
