# Stripe MCP Integration with Supabase

## 🎯 Обзор

Интеграция Stripe MCP (Model Context Protocol) с Supabase для обработки платежей в sandbox среде.

## ✅ Статус интеграции

- ✅ **Stripe MCP подключен** - аккаунт `acct_1SL2CsI7WlzwsAbQ`
- ✅ **Supabase таблица** - `transaction log` с Stripe полями
- ✅ **Тестовые данные** - созданы customer, product, price
- ✅ **Платеж обработан** - успешно через Stripe MCP → Supabase

## 🏗️ Архитектура

```
Stripe MCP → Supabase → Transaction Log
     ↓           ↓            ↓
  Sandbox    Database    Analytics
```

## 📊 Текущие данные

### Stripe Sandbox:
- **Customer**: `cus_THf3HC4LaZxKfM`
- **Product**: `prod_THf3LsuDx7K3ZD` 
- **Price**: `price_1SL5jNI7WlzwsAbQ1enyj0a1` ($9.99)

### Supabase:
- **Таблица**: `transaction log`
- **Записей**: 1 платеж на $29.99
- **Статус**: completed

## 🚀 Использование

### Базовый пример:

```javascript
const { StripeMCPIntegration } = require('./stripe-mcp-integration');

const integration = new StripeMCPIntegration();

// Создание клиента
const customer = await integration.createCustomer({
  name: 'John Doe',
  email: 'john@example.com'
});

// Создание продукта
const product = await integration.createProduct({
  name: 'Premium Plan',
  description: 'Monthly subscription'
});

// Обработка платежа
const payment = await integration.processPayment({
  userId: 'user-uuid',
  merchantId: 'merchant-uuid',
  appId: 'app-uuid',
  productId: 'product-uuid',
  amount: 29.99,
  currency: 'usd'
});
```

### Полный тест:

```bash
node stripe-mcp-integration.js
```

## 📋 Доступные функции

### Stripe MCP:
- `getStripeAccountInfo()` - информация об аккаунте
- `createCustomer()` - создание клиента
- `createProduct()` - создание продукта
- `createPrice()` - создание цены
- `processPayment()` - обработка платежа

### Supabase:
- `getPaymentAnalytics()` - аналитика платежей
- `testPaymentFlow()` - полный тест потока

## 🔧 Конфигурация

### Stripe MCP:
```javascript
const STRIPE_CONFIG = {
  account_id: "acct_1SL2CsI7WlzwsAbQ",
  environment: "sandbox",
  currency: "usd"
};
```

### Supabase:
```javascript
const config = {
  projectUrl: 'https://qosblydpgejtnyvzctpg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIs...'
};
```

## 📈 Аналитика

Текущие метрики:
- **Всего платежей**: 1
- **Успешных**: 1  
- **Общая выручка**: $29.99

## 🧪 Тестирование

### Sandbox сценарии:
1. **Успешный платеж** - стандартная карта
2. **Отклоненный платеж** - карта с ошибкой
3. **Недостаточно средств** - карта без средств

### Тестовые карты:
- `4242424242424242` - успешный платеж
- `4000000000000002` - отклонение
- `4000000000009995` - недостаточно средств

## 🔒 Безопасность

- **RLS включен** - Row Level Security
- **Sandbox режим** - тестовые транзакции
- **Анонимный доступ** - для тестирования

## 📁 Файлы

- `stripe-mcp-integration.js` - основная интеграция
- `stripe-sandbox-integration.js` - sandbox тестирование
- `README-STRIPE-MCP.md` - документация

## 🎯 Следующие шаги

1. **Настройка webhooks** - для real-time уведомлений
2. **Добавление аутентификации** - для production
3. **Расширение аналитики** - детальные отчеты
4. **Интеграция с UI** - фронтенд компоненты

## 🔗 Полезные ссылки

- [Stripe MCP Documentation](https://docs.stripe.com/mcp)
- [Supabase Dashboard](https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg)
- [Stripe Sandbox](https://dashboard.stripe.com/test)
