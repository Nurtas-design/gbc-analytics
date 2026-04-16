# GBC Analytics Dashboard

Аналитика заказов в реальном времени для коллекции Nova.

**RetailCRM → Supabase → Vercel Dashboard + Telegram Bot**

🔗 Dashboard: [https://gbc-analytics-dashboard-theta.vercel.app](https://gbc-analytics-dashboard-theta.vercel.app)

---

## Структура проекта

```
gbc-analytics-dashboard/
├── index.html              # Основной дашборд (KPI + 4 диаграммы + таблица)
├── order.html              # Форма оформления заказа
├── order.js                # Логика формы (validation, Supabase POST, UTM)
├── app.js                  # Логика дашборда (Supabase, Chart.js, i18n)
├── styles.css              # Dark theme стили (дашборд)
├── order.css               # Dark theme стили (форма)
├── vercel.json             # Конфигурация роутов Vercel
├── mock_orders.json        # 50 тестовых заказов
├── upload_to_retailcrm.py  # Шаг 2: mock_orders → RetailCRM API
├── sync_to_supabase.py     # Шаг 3: RetailCRM → синхронизация с Supabase
├── reset_and_sync.py       # Утилита для очистки и повторной загрузки Supabase
├── fix_utm_supabase.py     # Скрипт исправления полей utm_source
└── telegram_bot.py         # Шаг 5: Telegram-уведомления для заказов 50 000₸+
```

---

## Какие промпты я давал

### Шаг 1 — Dashboard (index.html + app.js + styles.css)

Первый промпт был слишком общим, Claude сделал мало:

> "сделай дашборд для заказов"

Claude сгенерировал просто пустой HTML-скелет — без данных, без стилей, без логики. Пришлось уточнить:

> "сделай index.html. Нужно получать заказы из Supabase. KPI-карточки: общее количество заказов, общий оборот, средний чек, VIP-заказы (50к+). 4 диаграммы через Chart.js: bar chart по городам, doughnut по utm_source, распределение по ценам, horizontal bar по обороту UTM. Таблица последних 10 заказов. Dark theme. На 3 языках: казахском, русском, английском — с кнопками переключения языка."

После этого получилось что-то рабочее.

---

### Шаг 2 — Форма заказа (order.html + order.js)

> "сделай order.html. Форма: имя, фамилия, телефон, email, город (select), товары (динамическое добавление/удаление, название + количество + цена). Общая сумма должна считаться автоматически. POST в Supabase. Валидация. При успешной отправке показывать overlay. Дизайн — dark theme как в index.html."

В первой версии валидация работала некорректно — форма отправлялась даже при пустом поле телефона. Сказал:

> "исправь валидацию: если телефон и город пустые — форма не должна отправляться, показывай сообщение об ошибке"

Исправил.

---

### Шаг 3 — mock_orders.json

Здесь возникло первое серьёзное препятствие. Думал, что в репозитории уже есть `mock_orders.json`, открыл — оказалось, это конфигурация rewrites для `vercel.json`:

```json
{ "rewrites": [{ "source": "/order", "destination": "/order.html" }] }
```

Реальных заказов не было, название файла ввело в заблуждение. Сказал Claude:

> "сделай mock_orders.json, пусть будет 50 тестовых заказов. Города Казахстана: Алматы, Астана, Шымкент, Караганда, Атырау и др. Настоящие казахские имена. utm_source: instagram, google, tiktok, direct, referral. Цены от 15 000 до 95 000. Некоторые должны быть VIP (50 000+)."

Сгенерировал 50 заказов, все в правильном формате.

---

### Шаг 4 — upload_to_retailcrm.py

> "напиши Python-скрипт: читает mock_orders.json и загружает в RetailCRM API v5. endpoint: /api/v5/orders/create. Передавать firstName, lastName, phone, email, items (name, qty, price), delivery.address.city."

Запустил — работает, но в RetailCRM поле utm_source пустое. Оказалось, скрипт не передавал customFields. Сказал:

> "добавь передачу customFields utm_source, добавь объект customFields из mock_orders.json прямо в order"

Добавил — теперь utm_source тоже загружается корректно.

---

### Шаг 5 — sync_to_supabase.py

> "напиши Python-скрипт: забирает все заказы из RetailCRM API v5 и сохраняет в Supabase. Должна быть пагинация. Без дублей — upsert по crm_id."

Скрипт написал, запустил первый раз — работает. Но при повторном запуске все заказы создаются заново, дубли. Посмотрел логи Supabase:

```
duplicate key value violates unique constraint "orders_crm_id_key"
```

Сказал Claude:

> "upsert не работает, создаются дублирующиеся заказы. Заголовок Prefer есть, но не помогает"

Claude объяснил: для upsert в Supabase недостаточно одного `Prefer: resolution=merge-duplicates`, в URL тоже должен быть параметр `?on_conflict=crm_id`. Только вместе они работают. Исправил — после этого upsert стал корректным.

---

### Шаг 6 — telegram_bot.py

> "напиши Telegram-бота. Если в RetailCRM появляется новый заказ на сумму свыше 50 000 — отправлять уведомление в Telegram. В сообщении: имя клиента, телефон, город, список товаров, общая сумма. Команды бота: /start, /status, /lang. Поддержка 3 языков. Кнопки меню."

Бот написан. Запустил — /start работает, меню появилось. Но через 2–3 минуты бот упал, в терминале:

```
requests.exceptions.ReadTimeout: HTTPSConnectionPool read timed out
```

Сказал Claude:

> "бот падает с ReadTimeout при getUpdates"

Claude объяснил: timeout у `requests.get` был выставлен в 20 секунд, и параметр `timeout` у `getUpdates` в Telegram тоже 20 секунд. Пока Telegram ждёт 20 секунд и возвращает ответ, requests тоже ровно в этот момент уходит в timeout. Timeout у `requests` должен быть минимум на 5 секунд больше, чем у Telegram: Telegram `timeout=25`, requests `timeout=30`. После исправления бот заработал стабильно.

---

### Шаг 7 — Определение UTM-трафика

Нужно было автоматически определять, откуда пришёл клиент. Изначально думал — можно использовать `document.referrer`, чтобы понять, пришёл ли пользователь из Instagram, Telegram, TikTok.

> "добавь в order.js автоматическое определение utm_source. Если клиент пришёл из Instagram — сохранять 'instagram', из Telegram — 'telegram'"

Написал, но при проверке выяснилось: Instagram, TikTok, WhatsApp намеренно блокируют `document.referrer` — по политике безопасности. Поэтому для этих платформ referrer не работает и записывается как "direct".

Решение — готовить ссылки с UTM-параметрами:

```
/order.html?utm_source=instagram
/order.html?utm_source=telegram
/order.html?utm_source=tiktok
```

Плюс в order.html добавили панель **UTM Link Generator** — нажимаешь кнопку, выходят готовые ссылки для всех платформ, нажимаешь Copy, отправляешь в Instagram или Telegram. Когда клиент переходит по ссылке — utm_source определяется автоматически.

---

### Шаг 8 — Баг переключения языка

При смене языка в дашборде весь текст переводится, но кнопка «Оформить заказ» в хедере не меняется. Заметил — текст кнопки не был добавлен в объект `T`. Сказал Claude:

> "при смене языка текст кнопки заказа в хедере не переводится, исправь"

Claude добавил ключ `orderBtn` в объект T и обработал его в функции `applyTranslations`.

---

### Шаг 9 — Мобильная оптимизация

При открытии формы на телефоне поля были слишком узкими, строки товаров не помещались. На iOS ещё и появлялся зум при вводе.

> "сделай responsive для мобильных: поля в одну колонку, строки товаров карточками, без iOS-зума"

Оба CSS-файла обновлены — поля выстраиваются в одну колонку, строки товаров принимают форму карточек, на iOS выставлен `font-size: 16px`, зума нет. UTM-панель на мобильных открывается снизу на всю ширину.

---

## Итог — где застрял

| # | Проблема | Причина | Решение |
|---|---------|---------|---------|
| 1 | В `mock_orders.json` нет заказов | Файл оказался конфигом Vercel | Заново сгенерировал 50 заказов |
| 2 | utm_source пустой в RetailCRM | `customFields` не добавили в скрипт загрузки | Добавил блок `customFields` в скрипт |
| 3 | Supabase upsert создавал дубли | В URL не было `?on_conflict=crm_id` | Добавил параметр в endpoint URL |
| 4 | Telegram-бот падал с ReadTimeout | `requests` timeout ≤ Telegram timeout | `requests timeout=30`, Telegram `timeout=25` |
| 5 | Кнопка заказа не переводилась | `orderBtn` отсутствовал в объекте T | Добавлен в `applyTranslations` |
| 6 | Referrer из Instagram не определялся | Instagram/TikTok/WhatsApp блокируют referrer | UTM-параметры + панель Link Generator |
| 7 | Форма не помещалась на мобильных | Нет responsive CSS | Написаны полноценные media queries |

---

## Инструкция по запуску

### Создание таблицы в Supabase

Выполните в SQL Editor:

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

### Запуск скриптов

```bash
pip install requests

# Шаг 2: mock_orders.json → RetailCRM
python upload_to_retailcrm.py

# Шаг 3: RetailCRM → Supabase
python sync_to_supabase.py

# Очистка и повторная загрузка Supabase (при необходимости)
python reset_and_sync.py

# Шаг 5: Telegram-бот
python telegram_bot.py
```

### Деплой на Vercel

```bash
npm i -g vercel
vercel --prod
```

Или через GitHub → Vercel dashboard → «Import repository» — деплой произойдёт автоматически.
