# Stripe Webhook Setup Scripts

## Create Webhook Endpoint

Автоматическое создание webhook endpoint в Stripe Dashboard.

### Использование

```bash
# 1. Перейти в директорию проекта
cd /Users/dmitryivanov/Documents/Work/development-ai/webshops-specs/web-shop-payment

# 2. Установить зависимости (если еще не установлено)
npm install

# 3. Запустить скрипт с вашим Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_... node scripts/create-webhook-endpoint.js
```

### Что делает скрипт

1. ✅ Создает webhook endpoint в Stripe
2. ✅ Настраивает URL: `https://web-shop-payment.vercel.app/api/webhooks/stripe`
3. ✅ Подписывается на события:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. ✅ Возвращает Webhook Signing Secret (whsec_...)

### Пример вывода

```
🔧 Initializing Stripe client...

📡 Creating webhook endpoint...
   URL: https://web-shop-payment.vercel.app/api/webhooks/stripe
   Events: payment_intent.succeeded, payment_intent.payment_failed

✅ Webhook endpoint created successfully!

📋 Webhook Details:
   ID: we_1ABC123...
   URL: https://web-shop-payment.vercel.app/api/webhooks/stripe
   Status: enabled
   Events: payment_intent.succeeded, payment_intent.payment_failed

🔐 Webhook Signing Secret:
   whsec_ABC123XYZ...

⚠️  IMPORTANT: Save this secret to Vercel Environment Variables!

Next steps:
1. Copy the webhook secret above (whsec_...)
2. Go to Vercel Dashboard → web-shop-payment → Settings → Environment Variables
3. Add new variable:
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_ABC123XYZ...
4. Redeploy the application

🎉 Done! Your webhook is ready to receive events from Stripe.
```

### После создания webhook

1. **Скопировать webhook secret** (whsec_...)
2. **Добавить в Vercel**:
   - Vercel Dashboard → Settings → Environment Variables
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...`
3. **Redeploy** приложение (или Vercel сделает это автоматически)
4. **Проверить** работоспособность (см. `WEBHOOK_SETUP.md`)

### Troubleshooting

#### Error: STRIPE_SECRET_KEY not set

```bash
# Проверьте что вы передали ключ:
STRIPE_SECRET_KEY=sk_test_... node scripts/create-webhook-endpoint.js
```

#### Error: Authentication failed

```bash
# Проверьте что ключ правильный:
# - Test mode: sk_test_...
# - Live mode: sk_live_...
```

#### Error: URL invalid

```bash
# URL должен быть HTTPS и доступен публично
# Убедитесь что приложение задеплоено на Vercel
```

### Альтернатива: curl команда

Если не хотите использовать скрипт:

```bash
curl https://api.stripe.com/v1/webhook_endpoints \
  -u YOUR_STRIPE_SECRET_KEY: \
  -d url="https://web-shop-payment.vercel.app/api/webhooks/stripe" \
  -d "enabled_events[]"="payment_intent.succeeded" \
  -d "enabled_events[]"="payment_intent.payment_failed" \
  -d description="Hybrid Payment Recording"
```

### Проверка созданных webhooks

```bash
# Список всех webhook endpoints
curl https://api.stripe.com/v1/webhook_endpoints \
  -u YOUR_STRIPE_SECRET_KEY:

# Или в Stripe Dashboard:
# https://dashboard.stripe.com/webhooks
```

