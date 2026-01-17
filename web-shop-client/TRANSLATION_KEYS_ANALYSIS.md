# Анализ ключей переводов из Supabase для применения через EventBus

## 📊 Ключи в Supabase (EN/AR)

### ✅ Уже используются через EventBus

#### 1. **Auth Module** (`auth.*`)
- ✅ `auth.loginButton` → `AuthPresenter.updateLabelsFromTranslations()`
- ✅ `auth.logoutButton`
- ✅ `auth.appIdPlaceholder`
- ✅ `auth.userIdPlaceholder`
- ✅ `auth.submitButton`
- ✅ `auth.welcomeTitle`
- ✅ `auth.welcomeMessage`
- ✅ `auth.welcomeSubtitle`
- ✅ `auth.enterAppId`
- ✅ `auth.enterUserId`
- ✅ `auth.successMessage`
- ✅ `auth.loadingMessage`
- ✅ `auth.errorMessage`
- ✅ `auth.helpQuestion`
- ✅ `auth.helpAnswer`
- ✅ `auth.agreementText`
- ✅ `auth.privacyPolicy`
- ✅ `auth.termsOfService`
- ✅ `auth.refundPolicy`
- ✅ `auth.login`, `auth.logout`, `auth.submit`, `auth.success`, `auth.error`, `auth.loading`

**Обработчик:** `AuthLocalizationLoadedEventHandler` + `AuthLocalizationChangedEventHandler`

---

#### 2. **Products Module** (`products.*`)
- ✅ `products.buyButton` → `ProductsListPresenter.updateLabelsFromTranslations()`
- ✅ `products.title`
- ✅ `products.emptyState`
- ✅ `products.loadingState`
- ✅ `products.purchasedBadge`

**Отсутствуют в коде (но есть в Supabase):**
- ❌ `products.addToCart` - используется в коде, но нет в Supabase
- ❌ `products.outOfStock` - используется в коде, но нет в Supabase
- ❌ `products.loadingProducts` - используется в коде, но нет в Supabase
- ❌ `products.errorLoadingProducts` - используется в коде, но нет в Supabase
- ❌ `products.productsTitle` - используется в коде, но нет в Supabase

**Обработчик:** `ProductsLocalizationLoadedEventHandler` + `ProductsLocalizationChangedEventHandler`

---

#### 3. **App Layout / Navigation** (`nav.*`)
- ✅ `nav.home` → `SidebarRendererPresenter.onTranslationsConfig()`
- ✅ `nav.store`
- ✅ `nav.patchNotes`
- ✅ `nav.dailyRewards`
- ✅ `nav.loyaltyProgram`
- ✅ `nav.news`
- ✅ `nav.updates`
- ✅ `nav.events`
- ✅ `nav.language`

**Обработчик:** `AppLayoutLocalizationLoadedEventHandler` + `AppLayoutLocalizationChangedEventHandler`

---

#### 4. **Offers Module** (`offers.*`)
- ✅ `offers.title` → `OffersListPresenter` (через `LocalizationLoadedEventHandler`)
- ✅ `offers.featuredTitle`
- ✅ `offers.emptyState`
- ✅ `offers.expiredBadge`

**Обработчик:** `OffersLocalizationLoadedEventHandler` + `OffersLocalizationChangedEventHandler`

---

#### 5. **App Level** (`app.*`)
- ✅ `app.loading` - **НЕ ПРИМЕНЯЕТСЯ** (нет обработчика)
- ✅ `app.title` - **НЕ ПРИМЕНЯЕТСЯ** (нет обработчика)

---

## 🚀 Рекомендации для применения через EventBus

### 1. **Daily Rewards Module** - добавить поддержку переводов

**Текущее состояние:** Модуль не использует переводы через EventBus

**Доступные ключи (ожидаемые):**
- `dailyRewards.title`
- `dailyRewards.claimButton`
- `dailyRewards.claimedButton`
- `dailyRewards.dayPrefix`
- `dailyRewards.loading`

**Действие:**
1. Создать `DailyRewardsLocalizationLoadedEventHandler`
2. Добавить метод `updateLabelsFromTranslations()` в `DailyRewardsPresenter`
3. Зарегистрировать обработчик в DI контейнере

---

### 2. **Patch Notes Module** - добавить поддержку переводов

**Текущее состояние:** Модуль не использует переводы через EventBus

**Доступные ключи (ожидаемые):**
- `patchNotes.title`
- `patchNotes.version`
- `patchNotes.date`
- `patchNotes.readMore`
- `patchNotes.loading`

**Действие:**
1. Создать `PatchNotesLocalizationLoadedEventHandler`
2. Добавить метод `updateLabelsFromTranslations()` в `PatchNotesPresenter`
3. Зарегистрировать обработчик в DI контейнере

---

### 3. **App Level** - добавить глобальные переводы

**Ключи в Supabase:**
- `app.loading`
- `app.title`

**Действие:**
1. Создать глобальный обработчик или использовать `LocalizationPresenter`
2. Применить переводы в корневых компонентах (`app/layout.tsx`, `app/page.tsx`)

---

### 4. **Products Module** - добавить недостающие ключи в Supabase

**Нужно добавить в Supabase:**
- `products.addToCart`
- `products.outOfStock`
- `products.loadingProducts`
- `products.errorLoadingProducts`
- `products.productsTitle`

**Или:** Обновить `ProductsListPresenter` для использования существующих ключей

---

## 📝 Сводная таблица

| Модуль | Ключи в Supabase | Используется через EventBus | Статус |
|--------|------------------|----------------------------|--------|
| **Auth** | 27 ключей | ✅ Да | ✅ Полностью реализовано |
| **Products** | 10 ключей | ✅ Да | ✅ Полностью реализовано |
| **Navigation** | 9 ключей | ✅ Да | ✅ Полностью реализовано |
| **Offers** | 5 ключей | ✅ Да | ✅ Полностью реализовано |
| **Daily Rewards** | 15 ключей | ✅ Да | ✅ Полностью реализовано |
| **Patch Notes** | 8 ключей | ✅ Да | ✅ Полностью реализовано |
| **App** | 2 ключа | ⚠️ Частично | ⚠️ Используется напрямую в layout.tsx |

---

## 🔧 План реализации

### Приоритет 1: Daily Rewards Module
1. Добавить ключи переводов в Supabase
2. Создать `DailyRewardsLocalizationLoadedEventHandler`
3. Обновить `DailyRewardsPresenter` с методом `updateLabelsFromTranslations()`
4. Зарегистрировать обработчик

### Приоритет 2: Patch Notes Module
1. Добавить ключи переводов в Supabase
2. Создать `PatchNotesLocalizationLoadedEventHandler`
3. Обновить `PatchNotesPresenter` с методом `updateLabelsFromTranslations()`
4. Зарегистрировать обработчик

### Приоритет 3: App Level
1. Применить `app.loading` и `app.title` через `LocalizationPresenter.viewModel`
2. Использовать в `app/layout.tsx` или корневых компонентах

### Приоритет 4: Products Module
1. Добавить недостающие ключи в Supabase
2. Обновить `ProductsListPresenter` для использования всех ключей

