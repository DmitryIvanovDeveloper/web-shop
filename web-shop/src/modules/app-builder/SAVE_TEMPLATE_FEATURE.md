# Функция сохранения шаблона в конфигурацию приложения

## 📋 Описание

Кнопка "Загрузить" теперь выполняет две функции:
1. **Загружает шаблон в редактор** (для предпросмотра и редактирования)
2. **Сохраняет конфигурацию в `app_configs_grape`** для указанного `appId`

## 🏗️ Архитектура (Clean Architecture)

### Domain Layer
- **`app-config.entity.ts`**: Обновлен тип `config` с `EditorConfigData` → `GrapeJsProjectData`
- Теперь используется единый формат данных GrapesJS

### Application Layer
- **`save-app-config.use-case.ts`**: Обновлен тип `SaveAppConfigRequest.config`
- **`load-template-to-app.use-case.ts`** (новый): Координирует загрузку шаблона и сохранение конфигурации
  - Валидация параметров
  - Получение шаблона через `GetTemplateDetailsUseCase`
  - Сохранение как конфигурацию через `SaveAppConfigUseCase`

### Infrastructure Layer
- **`types.ts`**: Добавлен символ `LoadTemplateToAppUseCase`
- **`bind.app-builder.ts`**: Зарегистрирован новый use case в DI контейнере
- **`app-config.repository.ts`**: Обновлен тип `AppConfigDto.config`

### Interface Adapters Layer

#### Presenters
- **`templates.presenter.ts`**: 
  - Добавлен метод `loadTemplateToApp()`
  - Добавлено поле `isSavingToApp` в `TemplatesViewModel`
  - Управление состоянием загрузки/сохранения

#### UI Components
- **`TemplatesList.tsx`**:
  - Добавлены props `appId` и `merchantId`
  - Кнопка "Загрузить" теперь вызывает `presenter.loadTemplateToApp()`
  - Показывает "Сохранение..." во время операции
  - Блокировка кнопки при сохранении

### Presentation Layer
- **`page.tsx`**:
  - Извлечение `appId` и `merchantId` из URL параметров
  - Передача параметров в `TemplatesList`

## 🔄 Flow диаграмма

```
[Пользователь нажимает "Загрузить"]
         ↓
[TemplatesList Component]
         ↓ 1. presenter.selectTemplate() → загружает детали
         ↓ 2. onLoadTemplate() → применяет в Editor
         ↓ 3. presenter.loadTemplateToApp()
         ↓
[TemplatesPresenter]
         ↓
[LoadTemplateToAppUseCase]
         ↓ GetTemplateDetailsUseCase
         ↓   ↳ GET /api/app-builder/templates/{id}
         ↓   ↳ Получить GrapeJsProjectData
         ↓
         ↓ SaveAppConfigUseCase
         ↓   ↳ POST /api/app-builder/config
         ↓
[AppConfigRepository]
         ↓
[API Route: /api/app-builder/config]
         ↓
[Supabase: app_configs_grape table]
         ↓ INSERT новая запись (is_active = true)
         ↓ UPDATE старые записи (is_active = false)
```

## 📊 Формат данных

### GrapeJsProjectData
```typescript
{
  pages: [
    {
      id: "main-page",
      type: "main",
      frames: [
        {
          component: { /* структура компонентов */ }
        }
      ]
    }
  ],
  styles: [
    {
      selectors: [".class-name"],
      style: { color: "#333", ... }
    }
  ],
  assets: [...]
}
```

### AppConfig
```typescript
{
  id: "uuid",
  appId: "APP123",
  merchantId: "550e8400-...",
  config: GrapeJsProjectData,  // ← Полный проект GrapesJS
  version: 1,
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Использование

### URL параметры (обязательные)
```
http://localhost:3000/app-builder?appId=APP123&merchantId=550e8400-e29b-41d4-a716-446655440000
```

### Процесс
1. Открыть страницу App Builder с параметрами `appId` и `merchantId`
2. Выбрать шаблон из списка (клик по строке)
3. Нажать кнопку "Загрузить"
4. Шаблон применяется в редакторе + сохраняется в БД

### Результат
- ✅ Шаблон загружен в GrapesJS Editor
- ✅ Конфигурация сохранена в `app_configs_grape`
- ✅ При следующей загрузке страницы конфигурация применится автоматически

## 🔍 Проверка

### Через Supabase
```sql
SELECT 
  app_id, 
  merchant_id, 
  is_active, 
  version,
  jsonb_pretty(config) as config
FROM app_configs_grape 
WHERE app_id = 'APP123'
ORDER BY created_at DESC;
```

### Через консоль браузера
```javascript
// В консоли должны быть логи:
// "Template project loaded successfully"
// "Template data changed: ..."
```

## ✅ Принципы Clean Architecture

1. **Separation of Concerns**: Каждый слой имеет свою ответственность
2. **Dependency Rule**: Зависимости направлены внутрь (к Domain)
3. **Dependency Inversion**: Зависимость от абстракций (ports), не от реализаций
4. **Single Responsibility**: Каждый класс/функция делает одно дело
5. **Testability**: Use Cases легко тестировать изолированно

## 🚀 Преимущества

- ✅ Единый формат данных (GrapeJsProjectData)
- ✅ Нет конвертации между форматами
- ✅ Типобезопасность на всех уровнях
- ✅ Переиспользуемость use cases
- ✅ Простота тестирования
- ✅ Соответствие Clean Architecture дяди Боба

---

## 📋 **Обновление: Разделение логики Select Template → Apply**

### **Новая логика:**

```typescript
// При выборе шаблона в списке (клик по строке):
1. presenter.selectTemplate(template.id)     // Загрузить детали
2. onSelectTemplate(templateData)           // Загрузить в Editor

// При нажатии кнопки "Apply":
1. editor.getProjectData()                   // Получить текущую конфигурацию
2. SaveAppConfigUseCase.execute(...)         // Сохранить в app_configs_grape
```

### **Изменённые файлы:**

#### **TemplatesList.tsx**
- ✅ Переименован проп `onLoadTemplate` → `onSelectTemplate`
- ✅ Добавлен проп `onApply?: () => Promise<void>`
- ✅ Клик по строке → автозагрузка в Editor
- ✅ Кнопка "Загрузить" → "Apply" (только сохранение)

#### **page.tsx**
- ✅ Переименован `handleLoadTemplate` → `handleSelectTemplate`
- ✅ Добавлен `handleApply` для сохранения конфигурации Editor
- ✅ Пропы: `onSelectTemplate` + `onApply`

#### **TemplatesPresenter.ts**
- ❌ Удалено поле `isSavingToApp` из `TemplatesViewModel`
- ❌ Удалён метод `loadTemplateToApp`
- ❌ Удалены импорты и инъекции `LoadTemplateToAppUseCase`

#### **DI Контейнер**
- ❌ Удалена регистрация `LoadTemplateToAppUseCase`
- ❌ Удалён тип `LoadTemplateToAppUseCase` из `APP_BUILDER_TYPES`

### **Преимущества нового подхода:**

1. **Чёткое разделение:**
   - **Select Template** → предпросмотр в Editor
   - **Apply** → сохранение изменений

2. **Лучший UX:**
   - Мгновенная загрузка при выборе
   - Явное сохранение по кнопке

3. **Гибкость:**
   - Можно редактировать шаблон перед сохранением
   - Можно сохранить любые изменения

4. **Clean Architecture:**
   - Сохранение происходит напрямую в Presentation Layer
   - Presenter отвечает только за управление списком шаблонов
