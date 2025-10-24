# 🔄 Integration Flow - Complete Purchase Journey

## 🎯 Полный поток покупки между приложениями

### Архитектура

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐
│   Web-Shop-Client   │────────>│  Web-Shop-Payment    │────────>│  Analytics Dashboard│
│   (Products)        │  Buy    │  (Checkout)          │  Track  │  (Supabase Data)    │
└─────────────────────┘         └──────────────────────┘         └─────────────────────┘
         │                                 │                               │
         └─────────────────────────────────┴───────────────────────────────┘
                            Supabase Database
                        (products, transaction log)
```

---

## 📱 Шаг 1: Client App - Просмотр продуктов

**URL**: https://web-shop-client-lj5ltd8at-dmitryivanovdeveloper-5910s-projects.vercel.app

### Что происходит:

1. **Загрузка продуктов из Supabase**
   ```typescript
   // SupabaseProductStorage.getAll()
   SELECT * FROM products ORDER BY created_at;
   ```

2. **Отображение продуктов**
   - Grid с карточками продуктов
   - Каждая карточка имеет:
     - Изображение продукта
     - Название (title)
     - Цена (currentPrice)
     - Редкость (rarity)
     - Скидка (discount)
     - Таймер (expires_at)
     - **Кнопка "BUY NOW"**

3. **Buy Button конфигурация**
   ```typescript
   buyButton: {
     enabled: true,
     redirectUrl: "https://web-shop-payment.../payment?productId=xxx&title=xxx&price=xxx&currency=USD&userId=xxx&appId=xxx",
     style: { backgroundColor: "rgb(255, 215, 0)", ... }
   }
   ```

---

## 💳 Шаг 2: Клик на "BUY NOW"

### Что происходит:

1. **onClick обработчик в OfferCard**
   ```typescript
   // offer-card.tsx
   onClick={(e) => {
     e.stopPropagation();
     if (onClick) onClick();  // Презентер логика
     if (buyButton.redirectUrl) {
       window.open(buyButton.redirectUrl, "_blank");
     }
   }}
   ```

2. **ProductsListPresenter обработка**
   ```typescript
   // SelectProductForPaymentUseCase
   - Загружает полные данные продукта из Supabase
   - Валидирует product ID, price, title
   - Получает userId из localStorage или генерирует временный
   ```

3. **PaymentRedirectService строит URL**
   ```typescript
   buildPaymentUrl({
     productId: "tank-turret",
     productTitle: "Tank Turret",
     productPrice: 99.99,
     productCurrency: "USD",
     userId: "6ed2e61d-047f-4157-9c75-17ca5e30c3d4",
     appId: "APP123"
   })
   ```

4. **Редирект**
   ```typescript
   window.location.href = paymentUrl;
   ```

---

## 🏦 Шаг 3: Payment App - Обработка платежа

**URL**: https://web-shop-payment-ie54yubx2-dmitryivanovdeveloper-5910s-projects.vercel.app/payment

### URL параметры:

```
?productId=tank-turret
&title=Tank%20Turret
&price=99.99
&currency=USD
&userId=6ed2e61d-047f-4157-9c75-17ca5e30c3d4
&appId=APP123
```

### Что происходит:

1. **PaymentPage получает параметры**
   ```typescript
   const searchParams = useSearchParams();
   const productId = searchParams.get('productId');
   const price = searchParams.get('price');
   const userId = searchParams.get('userId');
   ```

2. **Отображение формы оплаты**
   - Информация о продукте
   - Сумма к оплате
   - Форма карты (Stripe/другой провайдер)

3. **Обработка платежа**
   - CreatePaymentUseCase
   - ConfirmPaymentUseCase
   - SaveTransactionUseCase

4. **Сохранение в Supabase**
   ```sql
   INSERT INTO transaction_log (
     user_id, 
     product_id, 
     paid_amount, 
     payment_status,
     created_at
   ) VALUES (...);
   ```

5. **Редирект на Success/Cancel**
   - Success: `/payment/success?session_id=xxx`
   - Cancel: `/payment/cancel`

---

## 📊 Шаг 4: Analytics Dashboard - Отслеживание

**URL**: https://web-shop-mgnpjz7u8-dmitryivanovdeveloper-5910s-projects.vercel.app/merchant-admin/analytics/dashboard

### Что происходит:

1. **Автоматическое обновление данных**
   ```typescript
   // SupabasePurchaseRepository.getPurchaseSummary()
   SELECT * FROM transaction_log 
   WHERE payment_status = 'succeeded'
   AND created_at >= NOW() - INTERVAL '30 days';
   ```

2. **Расчет метрик**
   - Total Purchases: количество успешных транзакций
   - Unique Customers: количество уникальных user_id
   - Average Purchase Value: среднее значение paid_amount
   - Purchase Frequency: покупки на клиента

3. **Отображение в реальном времени**
   - Purchase Analytics Panel
   - Recent Purchases Table
   - Trend графики

---

## 🔄 Полный End-to-End поток

```
1. ПОЛЬЗОВАТЕЛЬ открывает Client App
   → Видит продукты из Supabase
   
2. ПОЛЬЗОВАТЕЛЬ нажимает "BUY NOW" на продукте
   → SelectProductForPaymentUseCase валидирует данные
   → PaymentRedirectService строит URL
   → Редирект на Payment App
   
3. PAYMENT APP получает параметры продукта
   → Отображает форму оплаты
   → Пользователь вводит данные карты
   → CreatePaymentUseCase создает платеж
   → ConfirmPaymentUseCase подтверждает
   
4. SUPABASE сохраняет транзакцию
   → INSERT INTO transaction_log
   
5. ANALYTICS DASHBOARD обновляется
   → SupabasePurchaseRepository загружает новые данные
   → Метрики пересчитываются
   → Графики обновляются
   
6. MERCHANT видит новую покупку
   → В таблице Recent Purchases
   → В метриках Purchase Analytics
```

---

## 🌐 Live URLs

| Приложение | URL | Роль |
|------------|-----|------|
| **Client** | https://web-shop-client-7fi5cs6g6-dmitryivanovdeveloper-5910s-projects.vercel.app | Каталог продуктов, Buy кнопки |
| **Payment** | https://web-shop-payment-ie54yubx2-dmitryivanovdeveloper-5910s-projects.vercel.app | Обработка платежей |
| **Analytics** | https://web-shop-mgnpjz7u8-dmitryivanovdeveloper-5910s-projects.vercel.app/merchant-admin/analytics/dashboard | Аналитика покупок |

---

## 🧪 Тестирование потока

### 1. Откройте Client App
```
https://web-shop-client-7fi5cs6g6-dmitryivanovdeveloper-5910s-projects.vercel.app
```

### 2. Найдите продукт с кнопкой "BUY NOW"
- Например: Dragon Slayer Sword, Tank Turret

### 3. Нажмите "BUY NOW"
- Откроется новая вкладка с Payment App
- URL будет содержать параметры продукта

### 4. Проверьте Analytics Dashboard
```
https://web-shop-mgnpjz7u8-dmitryivanovdeveloper-5910s-projects.vercel.app/merchant-admin/analytics/dashboard
```
- После успешной покупки транзакция появится в Recent Purchases
- Метрики обновятся

---

## 🔧 Environment Variables

### Client App (в Vercel Dashboard)

```env
NEXT_PUBLIC_PAYMENT_SERVICE_URL = https://web-shop-payment-ie54yubx2-dmitryivanovdeveloper-5910s-projects.vercel.app
NEXT_PUBLIC_SUPABASE_URL = https://qosblydpgejtnyvzctpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
```

⚠️ **Важно**: Убедитесь, что эти переменные добавлены в Vercel Dashboard для проекта `web-shop-client`!

---

## ✅ Результат

Полностью интегрированная система электронной коммерции:
- 🛒 Каталог продуктов (Supabase)
- 💳 Обработка платежей
- 📊 Аналитика в реальном времени
- 🔄 Автоматическое отслеживание транзакций

**Все три приложения связаны и работают вместе!** 🎉

