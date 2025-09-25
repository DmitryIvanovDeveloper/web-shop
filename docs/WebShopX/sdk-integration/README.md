# SDK Integration - SDK интеграции

*SDK и инструменты для интеграции с мобильными приложениями и играми*

---

## 📋 Структура модуля SDK Integration

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **🎮 Unity SDK** | SDK для Unity движка | [`unity-sdk/unity-sdk.md`](./unity-sdk/unity-sdk.md) |
| **🎯 Unreal SDK** | SDK для Unreal Engine | [`unreal-sdk/unreal-sdk.md`](./unreal-sdk/unreal-sdk.md) |
| **🌐 WebGL SDK** | SDK для WebGL приложений | [`webgl-sdk/webgl-sdk.md`](./webgl-sdk/webgl-sdk.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── overlay-manager (UI)           │
│  └── webview-handler (UI)           │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── sdk-generator                  │
│  ├── overlay-manager                │
│  └── deeplink-handler               │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── unity-sdk                      │
│  ├── unreal-sdk                     │
│  └── webgl-sdk                      │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **sdk-integration** → **authentication** (автовход через игру)
- **sdk-integration** → **webshop-experience** (открытие магазина)
- **sdk-integration** → **analytics** (отслеживание событий)

## 🎯 Ключевые особенности

- **🎮 Multi-platform** - поддержка Unity, Unreal, WebGL
- **🖥️ Overlay** - встроенный интерфейс в игру
- **🔗 Deep Links** - глубокие ссылки для навигации
- **📱 WebView** - встроенный браузер в приложения
- **⚡ Real-time** - мгновенная синхронизация данных
- **🔒 Безопасность** - защищенная интеграция

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Unity C#, Unreal C++, WebGL JavaScript, Android WebView, iOS Safari

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*



