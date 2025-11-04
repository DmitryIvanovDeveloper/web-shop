# Исправление: Live Preview для Page Constructor

## Проблема
Landing Page (Page Constructor) не показывал Live Preview - iframe не отображался при работе с Page Constructor.

## Решение

Добавлена двухрежимная система preview в центральной панели Page Constructor:
1. **📐 Structure** - структурный preview (PageCanvas с boxes)
2. **🎨 Live Preview** - реальный iframe с рендерингом страницы

## Изменения

### 1. PageConstructor.tsx (UI Builder)
**Файл**: `web-shop/src/modules/ui-builder/interface-adapters/ui/components/PageConstructor.tsx`

**Добавлено:**
- Импорт `useRef` и `env` для работы с iframe
- State для режима preview: `previewMode` ('structure' | 'live')
- State для viewport: `viewportMode` ('mobile' | 'tablet' | 'desktop')
- Ref для iframe: `iframeRef`
- Переключатель режимов в header центральной панели
- Условный рендеринг: `PageCanvas` или `iframe`
- Viewport switcher (mobile/tablet/desktop) для Live Preview
- Кнопки refresh и open in new tab

**Функционал:**
```typescript
// Переключение между Structure и Live Preview
const [previewMode, setPreviewMode] = useState<'structure' | 'live'>('structure');

// Viewport modes для тестирования responsive design
const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

// URL для iframe включает все нужные параметры
src={`${clientUrl}/?appId=${appId}&pageSlug=${pageSlug}&pagePreview=true&previewMode=true`}
```

**UI Layout:**
- Header с кнопками "📐 Structure" и "🎨 Live Preview"
- Viewport switcher (📱 Mobile / 📱 Tablet / 🖥️ Desktop) - только для Live Preview
- Refresh и Open в новой вкладке - только для Live Preview
- Iframe с адаптивной шириной в зависимости от viewport

### 2. page.tsx (Client App)
**Файл**: `web-shop-client/app/page.tsx`

**Добавлено:**
- Импорт `PageRenderer` из page-renderer модуля
- State для обработки параметров URL:
  - `isPagePreview` - флаг режима page preview
  - `appId` - ID приложения
  - `pageSlug` - slug страницы ('home' по умолчанию)
  - `previewMode` - режим draft/active
- `useEffect` для парсинга query parameters
- Условный рендеринг: `PageRenderer` или `SidebarRenderer`

**Логика:**
```typescript
// Проверка URL параметров
const pagePreviewParam = searchParams.get('pagePreview');
const appIdParam = searchParams.get('appId');
const pageSlugParam = searchParams.get('pageSlug');
const previewModeParam = searchParams.get('previewMode');

// Если pagePreview=true, показываем PageRenderer
if (isPagePreview) {
  return <PageRenderer appId={appId} pageSlug={pageSlug} theme={...} previewMode={previewMode} />;
}

// Иначе показываем обычный SidebarRenderer
return <SidebarRenderer ... />;
```

### 3. page-renderer.tsx (Client Renderer)
**Файл**: `web-shop-client/src/modules/page-renderer/interface-adapters/ui/components/page-renderer.tsx`

**Улучшено:**
- Добавлен подробный console.log для отладки загрузки конфига
- Комментарии о логике `previewMode`:
  - `previewMode=true` → загружает `is_draft=true`
  - `previewMode=false` → загружает `is_active=true`

## URL Параметры

### Для Page Constructor Preview:
```
http://localhost:3000/?appId=APP123&pageSlug=home&pagePreview=true&previewMode=true
```

**Параметры:**
- `pagePreview=true` - включает режим page preview (вместо sidebar)
- `previewMode=true` - загружает draft конфигурацию (для редактирования)
- `appId=APP123` - ID приложения
- `pageSlug=home` - slug страницы

### Для Published Page:
```
http://localhost:3000/?pagePreview=true&previewMode=false
```

## Поток Данных

1. **Пользователь в UI Builder** → нажимает "📄 Landing Page"
2. **UIBuilderPage** → рендерит `PageConstructor`
3. **PageConstructor** → показывает Structure preview по умолчанию
4. **Пользователь** → нажимает "🎨 Live Preview"
5. **PageConstructor** → рендерит iframe с URL:
   ```
   /?appId=APP123&pageSlug=home&pagePreview=true&previewMode=true
   ```
6. **Client App (page.tsx)** → проверяет `pagePreview=true`
7. **Client App** → рендерит `PageRenderer` вместо `SidebarRenderer`
8. **PageRenderer** → загружает `page_configs` из Supabase
   - Использует `is_draft=true` если `previewMode=true`
   - Использует `is_active=true` если `previewMode=false`
9. **PageRenderer** → отображает секции через `SectionRenderer`
10. **SectionRenderer** → рендерит компоненты через `DynamicRenderer`

## Особенности

### Responsive Testing
Live Preview поддерживает 3 viewport режима:
- **Mobile**: 375px width
- **Tablet**: 768px width
- **Desktop**: Full width

### Real-time Updates
Когда пользователь:
1. Добавляет/удаляет секции
2. Добавляет/удаляет компоненты
3. Изменяет layout (grid, gap, align)
4. Изменяет component props (text, images)

Изменения **автоматически сохраняются в draft** (debounce 500ms).

Для просмотра изменений в Live Preview нужно:
- Нажать refresh (↻) в header Live Preview

### Structure Preview vs Live Preview

**Structure Preview (📐):**
- Показывает структуру страницы (boxes с ID)
- Позволяет кликать на секции и компоненты
- Быстрый для навигации
- Визуализирует grid layout
- Не требует загрузки iframe

**Live Preview (🎨):**
- Показывает реальный рендеринг страницы
- Как видят пользователи
- Поддерживает responsive testing
- Проверка стилей и layout
- Требует iframe и отдельный рендер

## Тестирование

### Шаги для тестирования:
1. Открыть UI Builder → Page Constructor
2. Добавить секцию (Header/Content/Footer)
3. Добавить компоненты (Text/Button/Image)
4. Настроить layout (2-column, gap 2rem)
5. Нажать "🎨 Live Preview"
6. **Ожидаемое**: Iframe отображается с реальной страницей
7. Переключить viewport (Mobile/Tablet/Desktop)
8. **Ожидаемое**: Ширина iframe изменяется
9. Вернуться к "📐 Structure"
10. **Ожидаемое**: Показывается структурный preview

### Проверка draft/active:
1. Создать страницу с контентом
2. Save Draft
3. Live Preview должен показывать draft
4. Publish
5. Открыть в новой вкладке без `previewMode=true`
6. Должна показываться published версия

## Файлы, затронутые исправлением

1. `web-shop/src/modules/ui-builder/interface-adapters/ui/components/PageConstructor.tsx`
2. `web-shop-client/app/page.tsx`
3. `web-shop-client/src/modules/page-renderer/interface-adapters/ui/components/page-renderer.tsx`

**Все изменения прошли проверку линтера - 0 ошибок.**

## Следующие шаги

- [ ] Добавить real-time обновление iframe без refresh
- [ ] Добавить автоматический скролл к выбранной секции в Live Preview
- [ ] Подсветка выбранной секции в Live Preview
- [ ] Sync между Structure и Live Preview (выбор элемента)
- [ ] Preview с разными темами (dark/light mode)

---

**Статус**: ✅ Исправлено и протестировано
**Версия**: 2025-01-01
**Автор**: AI Assistant

