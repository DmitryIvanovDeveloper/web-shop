# 🛍️ Webshops Monorepo

Монорепозиторий с тремя Next.js приложениями для электронной коммерции.

## 📦 Проекты

| Проект | Описание | Deploy |
|--------|----------|--------|
| **web-shop** | Analytics Dashboard с интеграцией Supabase | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Smart-Mobile-Tech-FZCO/webshops-specs/tree/web-scenarios&project-name=webshops-analytics&root-directory=web-shop&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_USE_SUPABASE_PURCHASE,NEXT_PUBLIC_USE_SUPABASE_REVENUE) |
| **web-shop-client** | Клиентское приложение магазина | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Smart-Mobile-Tech-FZCO/webshops-specs/tree/web-scenarios&project-name=webshops-client&root-directory=web-shop-client) |
| **web-shop-payment** | Приложение для обработки платежей | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Smart-Mobile-Tech-FZCO/webshops-specs/tree/web-scenarios&project-name=webshops-payment&root-directory=web-shop-payment) |

---

## 🚀 Быстрый старт

### 1. Web-Shop (Analytics Dashboard)

**Требуемые переменные окружения:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://qosblydpgejtnyvzctpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_supabase_anon_key
NEXT_PUBLIC_USE_SUPABASE_PURCHASE=true
NEXT_PUBLIC_USE_SUPABASE_REVENUE=false
```

**После деплоя откройте:**
- Dashboard: `/merchant-admin/analytics/dashboard`

**Что включено:**
- ✅ Purchase Analytics с реальными данными из Supabase
- ✅ Recent Purchases таблица
- ✅ Real-time обновления
- ✅ Графики и метрики (Total Purchases, Unique Customers, AOV, LTV)

---

### 2. Web-Shop-Client

Клиентское приложение без дополнительных настроек.

**Главная страница:** `/`

---

### 3. Web-Shop-Payment

Приложение для обработки платежей без дополнительных настроек.

**Главная страница:** `/`

---

## 📝 Локальная разработка

### Web-Shop

```bash
cd web-shop
npm install
cp .env.example .env.local  # Добавьте свои Supabase ключи
npm run dev
```

### Web-Shop-Client

```bash
cd web-shop-client
npm install
npm run dev
```

### Web-Shop-Payment

```bash
cd web-shop-payment
npm install
npm run dev
```

---

## 🗄️ Структура базы данных Supabase

### Таблица: `transaction log`

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | uuid | Primary key |
| `user_id` | text | ID пользователя |
| `product_id` | text | ID продукта |
| `paid_amount` | numeric | Сумма платежа |
| `created_at` | timestamptz | Дата создания |
| `payment_status` | varchar | Статус платежа |
| `payment_method` | varchar | Метод оплаты |

### Таблица: `products`

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | text | Primary key |
| `title` | text | Название продукта |
| `rarity` | text | Редкость |
| `current_price` | numeric | Текущая цена |
| `original_price` | numeric | Оригинальная цена |

---

## 🔧 Технологии

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Deployment**: Vercel
- **Architecture**: Clean Architecture
- **DI**: Inversify
- **Testing**: Vitest, Playwright

---

## 📚 Документация

- [Deployment Guide](./DEPLOYMENT.md) - Подробная инструкция по деплою
- [Web-Shop README](./web-shop/README.md) - Документация Analytics Dashboard

---

## 🌐 Живые ссылки

После деплоя вы получите URLs вида:
- Analytics: `https://webshops-analytics.vercel.app`
- Client: `https://webshops-client.vercel.app`
- Payment: `https://webshops-payment.vercel.app`

---

## 🛠️ Структура монорепозитория

```
webshops-specs/
├── web-shop/              # Analytics Dashboard (Supabase)
│   ├── src/
│   │   ├── modules/       # Clean Architecture модули
│   │   ├── infrastructure/
│   │   └── shared/
│   ├── app/              # Next.js App Router
│   └── vercel.json
├── web-shop-client/       # Клиентское приложение
│   ├── src/
│   ├── app/
│   └── vercel.json
├── web-shop-payment/      # Платежное приложение
│   ├── src/
│   ├── app/
│   └── vercel.json
└── DEPLOYMENT.md         # Инструкции по деплою
```

---

## 🤝 Contributing

1. Создайте feature branch
2. Сделайте изменения
3. Создайте Pull Request в ветку `web-scenarios`

---

## 📄 License

MIT

---

## 💬 Support

Для вопросов и поддержки создайте Issue в репозитории.

