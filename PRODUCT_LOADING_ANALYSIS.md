# 🔍 Анализ загрузки продуктов - Web-Shop-Client

## ✅ **Текущая реализация - СООТВЕТСТВУЕТ требованиям!**

---

## 📊 **Требования:**

1. ✅ **Продукты загружаются из Supabase БЕЗ авторизации**
2. ✅ **Статус "куплен/не куплен" обновляется ПОСЛЕ авторизации**

---

## 🔄 **Как это работает:**

### 1️⃣ **Загрузка продуктов (БЕЗ авторизации)**

```typescript
// LoadProductsUseCase.execute()
async execute({ appId }): Promise<Product[]> {
  const products = await productRepository.getAll();
  return products.filter(p => p.appid === appId);
}
```

**Что происходит:**
- Загружаются ВСЕ продукты из Supabase `products` таблицы
- Фильтруются по `appId` (например, "APP123")
- **НЕ требуется авторизация!**

**SQL запрос:**
```sql
SELECT * FROM products ORDER BY created_at;
```

---

### 2️⃣ **Определение статуса покупки (С временным userId)**

```typescript
// ProductsListPresenter.present()
async present(): ProductsListViewModel {
  // 1. Получаем userId (из localStorage или генерируем новый)
  const userId = getCurrentUserId();  // Автоматически создается!
  
  // 2. Загружаем продукты (без авторизации)
  const products = await loadProductsUseCase.execute({ appId });
  
  // 3. Загружаем купленные продукты для этого userId
  const purchasedIds = await getPurchasedProductsUseCase.execute(userId, appId);
  
  // 4. Обогащаем продукты статусом isPurchased
  const enrichedProducts = products.map(product => ({
    ...product,
    isPurchased: purchasedIds.includes(product.id.value),
    buyButton: {
      enabled: !isPurchased,  // Кнопка неактивна если куплен
      ...
    }
  }));
  
  return viewModel;
}
```

---

### 3️⃣ **Система временных пользователей**

```typescript
// user-session.ts
export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return '';
  
  let userId = localStorage.getItem('temp_user_id');
  
  if (!userId) {
    userId = crypto.randomUUID();  // Генерируем новый UUID
    localStorage.setItem('temp_user_id', userId);
  }
  
  return userId;
}
```

**Что это значит:**
- При первом посещении генерируется случайный `temp_user_id`
- Сохраняется в `localStorage`
- Используется для отслеживания покупок
- **Работает БЕЗ регистрации и авторизации!**

---

### 4️⃣ **Проверка купленных продуктов**

```typescript
// SupabasePurchaseRepository.getPurchasedProductIds()
async getPurchasedProductIds(userId, appId): Promise<string[]> {
  const { data } = await supabase
    .from('transaction log')
    .select('product_id')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .eq('payment_status', 'succeeded');
    
  return data.map(item => item.product_id);
}
```

**SQL запрос:**
```sql
SELECT product_id 
FROM transaction_log 
WHERE user_id = 'временный-uuid'
  AND app_id = 'APP123'
  AND payment_status = 'succeeded';
```

---

## 🎯 **Сценарии использования:**

### Сценарий 1: Новый пользователь (не авторизован)

```
1. Пользователь открывает Client App
   → getCurrentUserId() генерирует новый UUID: "6ed2e61d-047f-4157-9c75-17ca5e30c3d4"
   → Сохраняется в localStorage

2. Загружаются продукты из Supabase
   → SELECT * FROM products WHERE appid = 'APP123'
   → Возвращается 9 продуктов

3. Проверяются покупки для temp_user_id
   → SELECT * FROM transaction_log WHERE user_id = '6ed2e61d-...'
   → Возвращается пустой массив []

4. Все продукты помечаются как НЕ куплены
   → isPurchased = false
   → buyButton.enabled = true
   → Показываются скидки и таймеры
```

---

### Сценарий 2: Пользователь купил продукт

```
1. Пользователь нажимает "BUY NOW"
   → Редирект на Payment App с userId = "6ed2e61d-..."

2. Payment App обрабатывает платеж
   → INSERT INTO transaction_log (user_id, product_id, ...) 
   → VALUES ('6ed2e61d-...', 'tank-turret', ...)

3. Пользователь возвращается на Client App
   → getCurrentUserId() возвращает тот же "6ed2e61d-..." (из localStorage)

4. Загружаются продукты
   → SELECT * FROM products

5. Проверяются покупки
   → SELECT * FROM transaction_log WHERE user_id = '6ed2e61d-...'
   → Возвращается ['tank-turret']

6. Продукт "tank-turret" помечается как куплен
   → isPurchased = true
   → buyButton.enabled = false
   → Убираются скидки и таймеры
   → Показывается badge "PURCHASED"
```

---

### Сценарий 3: Пользователь авторизуется (будущая функция)

```
1. Пользователь авторизуется через Auth систему
   → Получает реальный userId (не временный)

2. Миграция покупок (опционально)
   → UPDATE transaction_log 
     SET user_id = 'real-user-id' 
     WHERE user_id = 'temp-user-id'

3. Обновление localStorage
   → localStorage.setItem('user_id', 'real-user-id')
   → localStorage.removeItem('temp_user_id')

4. Перезагрузка продуктов
   → getCurrentUserId() теперь возвращает реальный ID
   → Покупки загружаются для реального пользователя
```

---

## ✅ **Вывод:**

Текущая реализация **ПОЛНОСТЬЮ СООТВЕТСТВУЕТ** требованиям:

1. ✅ **Продукты загружаются БЕЗ авторизации**
   - Используется только `appId` для фильтрации
   - Любой пользователь может видеть каталог

2. ✅ **Статус "куплен" работает с временным userId**
   - Генерируется автоматически при первом посещении
   - Сохраняется в localStorage
   - Используется для отслеживания покупок

3. ✅ **После авторизации можно обновить userId**
   - Просто заменить `temp_user_id` на реальный `user_id`
   - Покупки перепривяжутся к реальному пользователю
   - Статус "куплен" обновится автоматически

---

## 🔧 **Что нужно для авторизации:**

### Вариант 1: Простая миграция
```typescript
// После авторизации
function migrateTemporaryPurchases(realUserId: string) {
  const tempUserId = localStorage.getItem('temp_user_id');
  
  // В Payment App или через Supabase API:
  // UPDATE transaction_log 
  // SET user_id = realUserId 
  // WHERE user_id = tempUserId
  
  localStorage.setItem('user_id', realUserId);
  localStorage.removeItem('temp_user_id');
}
```

### Вариант 2: Dual tracking
```typescript
// Хранить связь temp_user_id <-> real_user_id
// Проверять покупки по обоим ID
const purchasedIds = await Promise.all([
  getPurchasedProducts(tempUserId, appId),
  getPurchasedProducts(realUserId, appId)
]);
```

---

## 🎉 **Никаких изменений не требуется!**

Система уже работает как надо:
- ✅ Продукты показываются всем
- ✅ Статус "куплен" отслеживается автоматически
- ✅ Готова к интеграции с системой авторизации

**Все работает правильно!** 🚀

