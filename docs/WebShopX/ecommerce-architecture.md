# E-commerce Platform Architecture

## Обзор проекта

E-commerce платформа с AI-персонализацией, построенная на принципах Clean Architecture и Domain-Driven Design. Платформа предоставляет комплексное решение для мерчантов с возможностями персонализации, аналитики и управления кампаниями.

## Ключевые особенности

- **AI Персонализация** - уникальная возможность глубокого использования ИИ
- **Мультиплатформенность** - не ограничено правилами App Store
- **Финансовые преимущества** - +15-25% ROAS, мгновенные выплаты
- **Поддержка криптовалют** - расширенные способы оплаты
- **Real-time аналитика** - мгновенные данные о продажах и конверсии

## Архитектурные принципы

- **Clean Architecture** - четкое разделение слоев
- **Domain-Driven Design** - модульная структура по bounded contexts
- **Event-Driven Architecture** - EventBus для межмодульного общения
- **Result Pattern** - единообразная обработка ошибок
- **Dependency Injection** - управление зависимостями через InversifyJS

## Структура проекта (Clean Architecture)

### Код приложения
```
src/
├── shared/                           # Общие компоненты
│   ├── result/
│   │   └── result.ts                 # Result Pattern
│   ├── design-system/
│   │   ├── colors.ts                 # Цветовая палитра
│   │   ├── typography.ts             # Типографика
│   │   └── spacing.ts                # Отступы
│   └── components/
│       └── universal/                # Universal UI компоненты
│           ├── universal-button.tsx
│           ├── universal-input.tsx
│           ├── universal-select.tsx
│           ├── universal-textarea.tsx
│           ├── universal-checkbox.tsx
│           ├── universal-datepicker.tsx
│           ├── universal-autocomplete.tsx
│           ├── field-wrapper.tsx
│           ├── required-pointer.tsx
│           └── index.ts
├── application/                      # Application слой
│   └── ports/                        # Порты (интерфейсы)
│       ├── logger.port.ts            # Логгер порт
│       ├── http-client.port.ts       # HTTP клиент порт
│       ├── event-bus.port.ts         # EventBus порт
│       └── export.port.ts            # Export сервис порт
├── infrastructure/                   # Инфраструктурный слой
│   ├── bootstrap/
│   │   ├── types.ts                  # Глобальные TYPES (Logger, HttpClient, EventBus, ExportService)
│   │   └── container.ts              # Корневой DI-контейнер
│   ├── http/
│   │   └── http-client.ts            # HTTP реализация
│   ├── logging/
│   │   └── console-logger.ts         # Логгер реализация
│   ├── event-bus/
│   │   └── event-bus.ts              # EventBus реализация
│   └── export/                       # Export сервис реализации
│       ├── csv-export.service.ts     # CSV экспорт
│       ├── excel-export.service.ts   # Excel экспорт
│       └── pdf-export.service.ts     # PDF экспорт
└── modules/                          # 📁 Модули приложения (Bounded Contexts)
    │                                 # 
    │                                 # 🎯 НАЗНАЧЕНИЕ: Содержит все бизнес-модули системы
    │                                 # 🏗️ АРХИТЕКТУРА: Каждый модуль - отдельный Bounded Context
    │                                 # 📋 ПРИНЦИПЫ: Следует принципам Clean Architecture
    │                                 # 🔄 ВЗАИМОДЕЙСТВИЕ: Межмодульное общение через EventBus
    │                                 # 🧪 ТЕСТИРОВАНИЕ: Каждый модуль изолированно тестируем
    │                                 #
    ├── 📁 merchant/                  # Родительская папка: Панель управления мерчанта
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Модули для управления магазином
    │   │                             # 📋 СТРУКТУРА: 6 модулей в родительской папке
    │   │                             # 🔄 СВЯЗИ: Взаимодействие через EventBus
    │   │                             #
    │   ├── campaign-management/      # Bounded Context: Управление кампаниями
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (Campaign, CampaignRule, CampaignTarget)
    │   │   │   ├── value-objects/    # Value Objects (CampaignId, CampaignType, CampaignStatus)
    │   │   │   ├── domain-services/  # Доменные сервисы (CampaignValidation, CampaignScheduling)
    │   │   │   ├── events/           # Доменные события (CampaignCreated, CampaignActivated, CampaignCompleted)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (CampaignRepository, CampaignNotification)
    │   │   │   ├── use-cases/        # Сценарии использования (CreateCampaign, ActivateCampaign, ScheduleCampaign)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (CampaignNotification, EmailService)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (CampaignManager)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── sku-management/           # Bounded Context: Управление товарами
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (SKU, Inventory, Pricing)
    │   │   │   ├── value-objects/    # Value Objects (SkuId, Price, Currency)
    │   │   │   ├── domain-services/  # Доменные сервисы (InventoryCalculation, PricingValidation)
    │   │   │   ├── events/           # Доменные события (SkuCreated, InventoryUpdated, PriceChanged)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (SkuRepository, InventoryRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (CreateSku, UpdateInventory, UpdatePricing)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (PricingService, InventoryService)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (SkuManagement)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── analytics/                # Bounded Context: Аналитика и метрики
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (AnalyticsMetric, AnalyticsReport, AnalyticsDashboard)
    │   │   │   ├── value-objects/    # Value Objects (MetricId, MetricValue, TimeRange)
    │   │   │   ├── domain-services/  # Доменные сервисы (MetricCalculation, ReportGeneration)
    │   │   │   ├── events/           # Доменные события (MetricUpdated, ReportGenerated)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (AnalyticsRepository, MLService)
    │   │   │   ├── use-cases/        # Сценарии использования (CalculateMetrics, GenerateReport, PredictTrends)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (AWSSageMaker, AWSPersonalize, AWSBedrock)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (AnalyticsDashboard)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── promo-management/         # Bounded Context: Управление промо и предложениями
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (PromoOffer, PromoCode, PromoRule)
    │   │   │   ├── value-objects/    # Value Objects (PromoId, DiscountPercent, PromoCode)
    │   │   │   ├── domain-services/  # Доменные сервисы (PromoValidation, DiscountCalculation)
    │   │   │   ├── events/           # Доменные события (PromoCreated, PromoActivated, PromoCodeUsed)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (PromoRepository, PromoNotification)
    │   │   │   ├── use-cases/        # Сценарии использования (CreatePromo, ActivatePromo, ValidatePromoCode)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (PromoNotification, EmailService)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (PromoManager)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── ui-builder/               # Bounded Context: Конструктор интерфейса
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (UITheme, UIComponent, UILayout)
    │   │   │   ├── value-objects/    # Value Objects (ThemeId, Color, Font)
    │   │   │   ├── domain-services/  # Доменные сервисы (ThemeValidation, LayoutCalculation)
    │   │   │   ├── events/           # Доменные события (ThemeCreated, ThemeApplied)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (ThemeRepository, ComponentRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (CreateTheme, ApplyTheme, CustomizeLayout)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (ThemePreview, ComponentLibrary)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (UIBuilder)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   └── merchant-dashboard/       # Bounded Context: Дашборд мерчанта
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (Dashboard, DashboardWidget, DashboardMetric)
    │       │   ├── value-objects/    # Value Objects (DashboardId, WidgetType, MetricType)
    │       │   ├── domain-services/  # Доменные сервисы (DashboardAggregation, MetricCalculation)
    │       │   ├── events/           # Доменные события (DashboardUpdated, WidgetAdded)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (DashboardRepository, MetricRepository)
    │       │   ├── use-cases/        # Сценарии использования (CreateDashboard, AddWidget, UpdateMetrics)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (MetricAggregation, DataVisualization)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (MerchantDashboard)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 rewards-system/            # Родительская папка: Система наград и лояльности
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Модули для наград и геймификации
    │   │                             # 📋 СТРУКТУРА: 2 модуля в родительской папке
    │   │                             # 🔄 СВЯЗИ: Интеграция с analytics и personalization-engine
    │   │                             #
    │   ├── daily-rewards/            # Bounded Context: Ежедневные награды
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (DailyReward, RewardSchedule)
    │   │   │   ├── value-objects/    # Value Objects (RewardId, RewardType, RewardValue)
    │   │   │   ├── domain-services/  # Доменные сервисы (RewardCalculation, ScheduleValidation)
    │   │   │   ├── events/           # Доменные события (RewardClaimed, RewardScheduled)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (RewardRepository, ScheduleRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (ClaimDailyReward, ScheduleReward)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (RewardNotification, SchedulerService)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (DailyRewards)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   └── loyalty-program/          # Bounded Context: Программа лояльности
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (LoyaltyProgram, LoyaltyTier, LoyaltyPoints)
    │       │   ├── value-objects/    # Value Objects (LoyaltyTier, PointsValue, TierThreshold)
    │       │   ├── domain-services/  # Доменные сервисы (LoyaltyCalculation, TierManagement)
    │       │   ├── events/           # Доменные события (LoyaltyTierUpgraded, PointsEarned)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (LoyaltyRepository, PointsRepository)
    │       │   ├── use-cases/        # Сценарии использования (ManageLoyalty, CalculateTier, TrackPoints)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (LoyaltyTracking, NotificationService)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (LoyaltyProgram)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 content-management/        # Родительская папка: Управление контентом
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Модули для управления контентом
    │   │                             # 📋 СТРУКТУРА: 2 модуля в родительской папке
    │   │                             # 🔄 СВЯЗИ: Интеграция с webshop-experience и localization
    │   │                             #
    │   ├── blog-news/                # Bounded Context: Блог и новости
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (BlogPost, NewsArticle, ContentCategory)
    │   │   │   ├── value-objects/    # Value Objects (ContentId, ContentType, ContentStatus)
    │   │   │   ├── domain-services/  # Доменные сервисы (ContentValidation, ContentModeration)
    │   │   │   ├── events/           # Доменные события (ContentPublished, ContentUpdated)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (ContentRepository, CategoryRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (PublishContent, ManageCategories, ScheduleContent, ModerateContent)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (ContentAPI, SearchService)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (BlogNews)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   └── media-support/            # Bounded Context: Медиа контент
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (MediaContent, MediaFile, MediaMetadata)
    │       │   ├── value-objects/    # Value Objects (MediaId, MediaType, FileSize, Resolution)
    │       │   ├── domain-services/  # Доменные сервисы (MediaProcessing, MediaValidation)
    │       │   ├── events/           # Доменные события (MediaUploaded, MediaProcessed)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (MediaRepository, FileStorage)
    │       │   ├── use-cases/        # Сценарии использования (UploadMedia, ProcessMedia, StreamMedia)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (MediaStreaming, CDN, FileStorage)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (MediaSupport)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 localization/              # Родительская папка: Локализация
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Модули для локализации
    │   │                             # 📋 СТРУКТУРА: 1 модуль в родительской папке
    │   │                             # 🔄 СВЯЗИ: Интеграция со всеми модулями
    │   │                             #
    │   └── localization-support/     # Bounded Context: Поддержка локализации
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (Localization, Translation, Language)
    │       │   ├── value-objects/    # Value Objects (LanguageCode, Region, TranslationKey)
    │       │   ├── domain-services/  # Доменные сервисы (TranslationService, LanguageDetection)
    │       │   ├── events/           # Доменные события (TranslationUpdated, LanguageChanged)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (TranslationRepository, LanguageRepository)
    │       │   ├── use-cases/        # Сценарии использования (TranslateContent, DetectLanguage, ManageTranslations, UpdateLocale, ValidateTranslation)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (TranslationAPI, LanguageDetectionAPI)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (Localization)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 personalization-engine/    # Родительская папка: AI персонализация
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: AI-движок персонализации
    │   │                             # 📋 СТРУКТУРА: 4 подмодуля с четкими границами
    │   │                             # 🔄 СВЯЗИ: Интеграция с другими модулями
    │   │                             #
    │   ├── rule-builder/             # Bounded Context: Создание правил персонализации
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (PersonalizationRule, RuleCondition, RuleAction)
    │   │   │   ├── value-objects/    # Value Objects (RuleID, ConditionType, ActionType)
    │   │   │   ├── domain-services/  # Доменные сервисы (RuleValidation, RuleExecution)
    │   │   │   ├── events/           # Доменные события (RuleCreated, RuleTriggered)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (RuleRepository, MLService)
    │   │   │   ├── use-cases/        # Сценарии использования (CreateRule, ExecuteRule)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (AWS SageMaker, Bedrock)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (RuleBuilder)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── audience-segmentation/    # Bounded Context: Сегментация аудитории
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (PlayerSegment, SegmentCriteria, SegmentResult)
    │   │   │   ├── value-objects/    # Value Objects (SegmentID, CriteriaType, SegmentSize)
    │   │   │   ├── domain-services/  # Доменные сервисы (SegmentationEngine, CriteriaValidation)
    │   │   │   ├── events/           # Доменные события (SegmentCreated, PlayerSegmented)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (SegmentRepository, PlayerRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (CreateSegment, SegmentPlayers)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (AWS Personalize, SageMaker)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (AudienceSegmentation)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── abandoned-cart-offers/    # Bounded Context: Предложения для брошенных корзин
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (AbandonedCart, CartOffer, ReminderSchedule)
    │   │   │   ├── value-objects/    # Value Objects (CartID, OfferType, ReminderType)
    │   │   │   ├── domain-services/  # Доменные сервисы (CartAnalysis, OfferGeneration)
    │   │   │   ├── events/           # Доменные события (CartAbandoned, OfferSent)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (CartRepository, OfferRepository, NotificationService)
    │   │   │   ├── use-cases/        # Сценарии использования (DetectAbandonedCart, SendOffer)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (EmailService, PushNotification)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (AbandonedCartOffers)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   └── liveops-automation/       # Bounded Context: Автоматизация маркетинга
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (AutomationWorkflow, WorkflowStep, WorkflowTrigger)
    │       │   ├── value-objects/    # Value Objects (WorkflowID, StepType, TriggerType)
    │       │   ├── domain-services/  # Доменные сервисы (WorkflowEngine, StepExecution)
    │       │   ├── events/           # Доменные события (WorkflowStarted, StepCompleted)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (WorkflowRepository, EventBus)
    │       │   ├── use-cases/        # Сценарии использования (CreateWorkflow, ExecuteWorkflow)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (SchedulerService, EventBus)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (LiveOpsAutomation)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 webshop-experience/        # Родительская папка: Пользовательский опыт
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Пользовательский интерфейс магазина
    │   │                             # 📋 СТРУКТУРА: Очищенная структура без лишних подмодулей
    │   │                             # 🔄 СВЯЗИ: Интеграция с rewards-system и content-management
    │   │                             #
    │   ├── shop-interface/           # Bounded Context: Интерфейс магазина
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (ShopInterface, ProductCatalog, ShoppingCart)
    │   │   │   ├── value-objects/    # Value Objects (ProductID, CartID, InterfaceConfig)
    │   │   │   ├── domain-services/  # Доменные сервисы (ShopNavigation, CartManagement)
    │   │   │   ├── events/           # Доменные события (ProductViewed, CartUpdated)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (ProductRepository, CartRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (BrowseShop, AddToCart)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (CDN, ProductAPI)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (ShopInterface)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   ├── external-links/           # Bounded Context: Внешние ссылки
    │   │   ├── domain/               # Domain Layer
    │   │   │   ├── entities/         # Бизнес-сущности (ExternalLink, LinkCategory)
    │   │   │   ├── value-objects/    # Value Objects (LinkID, LinkType, URL)
    │   │   │   ├── domain-services/  # Доменные сервисы (LinkValidation, LinkManagement)
    │   │   │   ├── events/           # Доменные события (LinkClicked, LinkAdded)
    │   │   │   └── errors/           # Доменные ошибки
    │   │   ├── application/          # Application Layer
    │   │   │   ├── ports/            # Порты (LinkRepository)
    │   │   │   ├── use-cases/        # Сценарии использования (ManageLinks, TrackClicks)
    │   │   │   └── services/         # Application Services для межмодульного взаимодействия
    │   │   ├── infrastructure/       # Infrastructure Layer
    │   │   │   ├── repositories/     # Реализации репозиториев
    │   │   │   ├── external-services/# Внешние сервисы (AnalyticsAPI)
    │   │   │   └── bootstrap/        # DI конфигурация
    │   │   └── interface-adapters/   # Interface Adapters Layer
    │   │       ├── presenters/       # Логика представления (ExternalLinks)
    │   │       └── views/            # UI компоненты (используют Universal компоненты)
    │   └── patch-notes/              # Bounded Context: Патч-ноты
    │       ├── domain/               # Domain Layer
    │       │   ├── entities/         # Бизнес-сущности (PatchNote, VersionInfo)
    │       │   ├── value-objects/    # Value Objects (VersionID, ChangeType, Priority)
    │       │   ├── domain-services/  # Доменные сервисы (VersionManagement, ChangeTracking)
    │       │   ├── events/           # Доменные события (PatchReleased, VersionUpdated)
    │       │   └── errors/           # Доменные ошибки
    │       ├── application/          # Application Layer
    │       │   ├── ports/            # Порты (PatchRepository)
    │       │   ├── use-cases/        # Сценарии использования (PublishPatch, GetVersionHistory)
    │       │   └── services/         # Application Services для межмодульного взаимодействия
    │       ├── infrastructure/       # Infrastructure Layer
    │       │   ├── repositories/     # Реализации репозиториев
    │       │   ├── external-services/# Внешние сервисы (VersionControlAPI)
    │       │   └── bootstrap/        # DI конфигурация
    │       └── interface-adapters/   # Interface Adapters Layer
    │           ├── presenters/       # Логика представления (PatchNotes)
    │           └── views/            # UI компоненты (используют Universal компоненты)
    │
    ├── 📁 authentication/            # Родительская папка: Аутентификация
    │   │                             # 
    │   │                             # 🎯 НАЗНАЧЕНИЕ: Аутентификация и управление сессиями
    │   │                             # 📋 СТРУКТУРА: Базовый модуль с README
    │   │                             # 🔄 СВЯЗИ: Интеграция со всеми модулями
    │   │                             #
    │   └── authentication/           # Bounded Context: Аутентификация
    │   ├── domain/                   # Domain Layer
    │   │   ├── entities/             # Бизнес-сущности (User, Session, Token)
    │   │   ├── value-objects/        # Value Objects (UserID, Email, Password, JWTToken)
    │   │   ├── domain-services/      # Доменные сервисы (Authentication, TokenValidation, SessionManagement)
    │   │   ├── events/               # Доменные события (UserRegistered, UserLoggedIn, UserLoggedOut)
    │   │   └── errors/               # Доменные ошибки
    │   ├── application/              # Application Layer
    │   │   ├── ports/                # Порты (UserRepository, SessionRepository, OAuthProvider)
    │   │   ├── use-cases/            # Сценарии использования (Login, Register, ValidateToken, RefreshToken, Logout)
    │   │   └── services/             # Application Services для межмодульного взаимодействия
    │   ├── infrastructure/           # Infrastructure Layer
    │   │   ├── repositories/         # Реализации репозиториев
    │   │   ├── external-services/    # Внешние сервисы (JWT, OAuth Google/Facebook, Bcrypt)
    │   │   └── bootstrap/            # DI конфигурация
    │   └── interface-adapters/       # Interface Adapters Layer
    │       ├── presenters/           # Логика представления (Login, Register, Profile)
    │       └── views/                # UI компоненты (используют Universal компоненты)
    │
    └── 📁 sdk-integration/           # Родительская папка: SDK интеграции
        │                             # 
        │                             # 🎯 НАЗНАЧЕНИЕ: SDK для интеграции с играми
        │                             # 📋 СТРУКТУРА: Базовый модуль с README
        │                             # 🔄 СВЯЗИ: Интеграция с authentication и webshop-experience
        │                             #
        └── sdk-integration/          # Bounded Context: SDK интеграции
        ├── domain/                   # Domain Layer
        │   ├── entities/             # Бизнес-сущности (SDKConfig, OverlayConfig, DeepLink)
        │   ├── value-objects/        # Value Objects (Platform, SDKVersion, DeepLinkURL)
        │   ├── domain-services/      # Доменные сервисы (SDKGenerator, OverlayManager, DeepLinkHandler)
        │   ├── events/               # Доменные события (SDKInitialized, OverlayOpened, DeepLinkHandled)
        │   └── errors/               # Доменные ошибки
        ├── application/              # Application Layer
        │   ├── ports/                # Порты (SDKRepository, OverlayRepository, DeepLinkRepository)
        │   ├── use-cases/            # Сценарии использования (GenerateSDK, InitializeOverlay, HandleDeepLink, ManageWebView)
        │   └── services/             # Application Services для межмодульного взаимодействия
        ├── infrastructure/           # Infrastructure Layer
        │   ├── repositories/         # Реализации репозиториев
        │   ├── external-services/    # Внешние сервисы (Unity SDK, Unreal SDK, WebGL SDK, Android WebView, iOS Safari)
        │   └── bootstrap/            # DI конфигурация
        └── interface-adapters/       # Interface Adapters Layer
            ├── presenters/           # Логика представления (SDKGenerator, OverlayManager, DeepLinkHandler)
            └── views/                # UI компоненты (используют Universal компоненты)
```

### Документация (соответствует кодовой структуре)
```
docs/WebShopX/
├── ecommerce-architecture.md         # Общая архитектура проекта
│
├── 📁 merchant/                      # Документация модулей панели управления мерчанта
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Панель управления мерчанта
│   │                                 # 📋 СТРУКТУРА: 6 модулей в родительской папке
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Межмодульное взаимодействие через EventBus
│   │                                 #
│   ├── analytics/                    # Документация модуля аналитики
│   ├── campaign-manager/             # Документация модуля управления кампаниями
│   ├── dashboard/                    # Документация модуля дашборда
│   ├── promo-offer-management/       # Документация модуля управления промо
│   ├── sku-management/               # Документация модуля управления товарами
│   └── ui-builder/                   # Документация модуля конструктора UI
│
├── 📁 personalization-engine/        # Документация AI-движка персонализации
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: AI персонализация и автоматизация
│   │                                 # 📋 СТРУКТУРА: 4 подмодуля с четкими границами
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Интеграция с другими модулями
│   │                                 #
│   ├── rule-builder/                 # Создание правил персонализации
│   ├── audience-segmentation/        # Сегментация аудитории
│   ├── abandoned-cart-offers/        # Предложения для брошенных корзин
│   └── liveops-automation/           # Автоматизация маркетинга
│
├── 📁 webshop-experience/            # Документация пользовательского опыта
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Пользовательский интерфейс магазина
│   │                                 # 📋 СТРУКТУРА: Очищенная структура без лишних подмодулей
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Интеграция с rewards-system и content-management
│   │                                 #
│   ├── shop-interface/               # Интерфейс магазина
│   ├── external-links/               # Внешние ссылки
│   └── patch-notes/                  # Патч-ноты
│
├── 📁 rewards-system/                # Документация системы наград
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Система наград и лояльности
│   │                                 # 📋 СТРУКТУРА: 2 подмодуля (daily-rewards + loyalty-program)
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Интеграция с analytics и personalization-engine
│   │                                 #
│   ├── daily-rewards/                # Ежедневные награды
│   └── loyalty-program/              # Программа лояльности
│
├── 📁 content-management/            # Документация управления контентом
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Управление контентом (блог, медиа)
│   │                                 # 📋 СТРУКТУРА: 2 подмодуля (blog-news + media-support)
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Интеграция с webshop-experience и localization
│   │                                 #
│   ├── blog-news/                    # Блог и новости
│   └── media-support/                # Медиа контент
│
├── 📁 localization/                  # Документация локализации
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Локализация интерфейса и контента
│   │                                 # 📋 СТРУКТУРА: 1 подмодуль (localization-support)
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, CSV файлы
│   │                                 # 🔄 СВЯЗИ: Интеграция со всеми модулями
│   │                                 #
│   └── localization/                 # Поддержка локализации
│
├── 📁 authentication/                # Документация аутентификации
│   │                                 # 
│   │                                 # 🎯 НАЗНАЧЕНИЕ: Аутентификация и управление сессиями
│   │                                 # 📋 СТРУКТУРА: Базовый модуль с README
│   │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, API
│   │                                 # 🔄 СВЯЗИ: Интеграция со всеми модулями
│   │                                 #
│   └── README.md                     # Основная документация модуля
│
└── 📁 sdk-integration/               # Документация SDK интеграций
    │                                 # 
    │                                 # 🎯 НАЗНАЧЕНИЕ: SDK для интеграции с играми
    │                                 # 📋 СТРУКТУРА: Базовый модуль с README
    │                                 # 📖 СОДЕРЖИМОЕ: Use Cases, Data Models, API
    │                                 # 🔄 СВЯЗИ: Интеграция с authentication и webshop-experience
    │                                 #
    └── README.md                     # Основная документация модуля
```

## Описание модулей

### 1. Campaign Management (`campaign-management`)

**Назначение:** Управление маркетинговыми кампаниями и рекламными акциями.

**Ответственность:**
- **Создание кампаний** - настройка правил, контента и таймеров
- **Персонализация** - индивидуальные предложения для каждого игрока
- **Аналитика эффективности** - детальная статистика по кампаниям
- **Автоматизация** - запуск кампаний по расписанию или условиям

**Ключевые Use Cases:**
- `CreateCampaign` - создание новой кампании
- `ActivateCampaign` - активация кампании
- `ScheduleCampaign` - планирование кампании
- `MonitorCampaign` - мониторинг эффективности
- `UpdateCampaign` - обновление параметров кампании

### 2. SKU Management (`sku-management`)

**Назначение:** Управление товарами, инвентарем и ценообразованием.

**Ответственность:**
- **CRUD операции** - создание, редактирование, удаление игровых предметов
- **Управление инвентарем** - отслеживание доступности контента
- **Локализация цен** - настройка цен для разных регионов
- **Аналитика продаж** - детальная статистика по каждому предмету

**Ключевые Use Cases:**
- `CreateSKU` - создание нового товара
- `UpdateInventory` - обновление остатков
- `UpdatePricing` - изменение цен
- `ManageCategories` - управление категориями
- `TrackInventory` - отслеживание движения товаров

### 3. Analytics (`analytics`)

**Назначение:** Специализированный аналитический сервис с ML-возможностями.

**Ответственность:**
- **Специализированный сервис** - собственный аналитический движок
- **Машинное обучение** - предсказательная аналитика и рекомендации
- **Real-time обработка** - мгновенная аналитика событий
- **Обнаружение аномалий** - автоматическое выявление необычных паттернов

**Ключевые Use Cases:**
- `CalculateMetrics` - расчет метрик и KPI
- `GenerateReport` - генерация отчетов
- `PredictTrends` - прогнозирование трендов
- `SegmentUsers` - сегментация пользователей
- `DetectAnomalies` - обнаружение аномалий

### 4. Promo Management (`promo-management`)

**Назначение:** Управление промо-акциями, скидками и специальными предложениями.

**Ответственность:**
- **Flow Editor** - визуальный редактор промо-цепочки
- **Гибкие условия** - сложные правила активации предложений
- **Автоматизация** - запуск по событиям и расписанию
- **A/B тестирование** - оптимизация эффективности предложений

**Ключевые Use Cases:**
- `CreatePromo` - создание промо-акции
- `ActivatePromo` - активация промо
- `ValidatePromoCode` - валидация промокодов
- `ManagePromoRules` - управление правилами промо
- `TrackPromoUsage` - отслеживание использования

### 5. UI Builder (`ui-builder`)

**Назначение:** Конструктор интерфейса магазина с drag & drop функциональностью.

**Ответственность:**
- **Drag & Drop редактор** - визуальное создание интерфейса
- **Темы и стили** - настройка внешнего вида под бренд
- **Адаптивность** - автоматическая адаптация под устройства
- **Персонализация** - индивидуальные интерфейсы для игроков

**Ключевые Use Cases:**
- `CreateTheme` - создание темы оформления
- `ApplyTheme` - применение темы
- `CustomizeLayout` - настройка макета
- `ManageComponents` - управление компонентами
- `PreviewTheme` - предварительный просмотр

### 6. Merchant Dashboard (`merchant-dashboard`)

**Назначение:** Агрегация и визуализация данных для мерчантов.

**Ответственность:**
- **Real-time мониторинг** - отслеживание всех аспектов игрового бизнеса
- **Интерактивные графики** - визуализация данных и трендов
- **Персонализация виджетов** - настройка под потребности
- **Алерты и уведомления** - мгновенная реакция на изменения

**Ключевые Use Cases:**
- `CreateDashboard` - создание дашборда
- `AddWidget` - добавление виджетов
- `UpdateMetrics` - обновление метрик
- `CustomizeLayout` - настройка макета
- `ExportDashboard` - экспорт дашборда

### 7. Rewards System (`rewards-system`)

**Назначение:** Система наград, лояльности и геймификации.

**Ответственность:**
- **Механика ежедневных наград** - ежедневные бонусы для игроков
- **Программа лояльности** - система уровней и баллов
- **Геймификация** - достижения и награды
- **Отслеживание прогресса** - мониторинг активности игроков

**Ключевые Use Cases:**
- `ClaimDailyReward` - получение ежедневной награды
- `ManageLoyalty` - управление программой лояльности
- `CalculateTier` - расчет уровня лояльности
- `TrackRewards` - отслеживание наград
- `ManageRewardRules` - управление правилами наград

### 8. Content Management (`content-management`)

**Назначение:** Управление контентом: блог, новости, медиа.

**Ответственность:**
- **Блог/новостная секция** - управление контентом
- **Поддержка медиа** - видео и изображения
- **Категоризация** - организация контента
- **Планирование публикаций** - расписание контента

**Ключевые Use Cases:**
- `PublishContent` - публикация контента
- `UploadMedia` - загрузка медиа
- `ManageCategories` - управление категориями
- `ScheduleContent` - планирование публикаций
- `ModerateContent` - модерация контента

### 9. Localization (`localization`)

**Назначение:** Локализация интерфейса и контента.

**Ответственность:**
- **Поддержка i18n** - интернационализация
- **RTL поддержка** - правосторонние языки
- **Переводы контента** - локализация текстов
- **Региональные настройки** - адаптация под регионы

**Ключевые Use Cases:**
- `TranslateContent` - перевод контента
- `DetectLanguage` - определение языка
- `ManageTranslations` - управление переводами
- `UpdateLocale` - обновление локали
- `ValidateTranslation` - валидация переводов

### 10. Personalization Engine (`personalization-engine`)

**Назначение:** AI-движок для персонализации предложений и автоматизации маркетинговых процессов.

**Ответственность:**
- Построитель правил с триггерами (время, сегмент, поведение)
- Сегментация аудитории (страна, RFM, ARPU, риск оттока)
- AI-движок предложений с интеграцией OpenAI-подобных API
- Многоуровневые промо (начальная + отложенная скидка)
- Таймеры и механики срочности
- Предложения для брошенных корзин и напоминания
- Автоматизация LiveOps на основе поведения
- Поведенческие триггеры и автоматизация

**Ключевые Use Cases:**
- `GenerateOffer` - генерация персонализированных предложений
- `SegmentUsers` - сегментация пользователей
- `PredictBehavior` - предсказание поведения пользователей
- `CreateRules` - создание правил персонализации
- `ExecuteAutomation` - выполнение автоматизированных процессов

### 11. Webshop Experience (`webshop-experience`)

**Назначение:** Пользовательский интерфейс магазина с возможностями персонализации и лояльности.

**Ответственность:**
- Механика ежедневных наград
- Программа лояльности с уровнями и баллами
- Промокоды для инфлюенсеров и партнеров
- Блог/новостная секция с бесконечной прокруткой
- Поддержка видео и медиа блоков
- Drag & drop редактор макетов
- Кастомизация тем (шрифты, фон, цвета)
- Поддержка локализации (i18n, RTL)
- Внешние ссылки и секция changelog

**Ключевые Use Cases:**
- `BrowseProducts` - просмотр продуктов с персонализацией
- `AddToCart` - добавление товаров в корзину
- `Checkout` - процесс оформления заказа
- `ClaimRewards` - получение наград и баллов
- `SharePromoCode` - использование и распространение промокодов

### 12. Authentication (`authentication`)

**Назначение:** Система аутентификации и управления пользовательскими сессиями.

**Ответственность:**
- Автовход через приложение/игру (JWT, OAuth2)
- Управление пользовательскими сессиями
- Валидация токенов и разрешений
- Безопасность и шифрование
- Управление профилями пользователей
- Интеграция с внешними провайдерами OAuth

**Ключевые Use Cases:**
- `Login` - вход в систему
- `Register` - регистрация пользователя
- `ValidateToken` - валидация токенов
- `RefreshToken` - обновление токенов
- `Logout` - выход из системы
- `ManageSessions` - управление пользовательскими сессиями


### 13. SDK Integration (`sdk-integration`)

**Назначение:** SDK и инструменты для интеграции с мобильными приложениями и играми.

**Ответственность:**
- SDK для Unity с overlay
- SDK для Unreal Engine с overlay
- SDK для WebGL с overlay
- Android Custom Tabs
- Android WebView поддержка
- iOS Safari с токен-авторизацией
- Инструменты разработчика
- Документация и примеры интеграции

**Ключевые Use Cases:**
- `GenerateSDK` - генерация SDK для платформ
- `InitializeOverlay` - инициализация overlay в играх
- `HandleDeepLinks` - обработка глубоких ссылок
- `ManageWebView` - управление WebView компонентами
- `ProvideExamples` - предоставление примеров интеграции

## Общие сервисы (Shared Services)

### Export Service (`export`)

**Назначение:** Универсальный сервис экспорта данных в различных форматах для всех модулей системы.

**Ответственность:**
- Экспорт данных в CSV формат
- Экспорт данных в Excel формат  
- Экспорт данных в PDF формат
- Валидация данных перед экспортом
- Поддержка различных шаблонов экспорта
- Асинхронная обработка больших объемов данных

**Архитектура:**
- **Порт:** `application/ports/export.port.ts`
- **Реализации:** `infrastructure/export/` (CSV, Excel, PDF сервисы)
- **DI:** Управляется через корневой контейнер

**Ключевые Use Cases:**
- `ExportDashboardData` - экспорт аналитических данных
- `ExportCampaignReport` - экспорт отчетов по кампаниям
- `ExportSKUAnalytics` - экспорт аналитики по товарам
- `ExportPlayerData` - экспорт данных игроков

**Интеграция с модулями:**
- Все модули `merchant-admin` используют единый Export Service
- Соблюдение принципа DRY (Don't Repeat Yourself)
- Единая точка управления логикой экспорта

## Межмодульное взаимодействие

### EventBus Events (ТОЛЬКО межмодульное общение)

```typescript
// События от authentication модуля
export class UserRegisteredEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly registrationDate: Date
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: UserId,
    public readonly loginDate: Date,
    public readonly platform: Platform
  ) {}
}

// События от campaign-management модуля
export class CampaignCreatedEvent {
  constructor(
    public readonly campaignId: CampaignId,
    public readonly merchantId: MerchantId,
    public readonly targetSegment: string,
    public readonly campaignType: 'personalized' | 'seasonal' | 'retargeting'
  ) {}
}

export class CampaignActivatedEvent {
  constructor(
    public readonly campaignId: CampaignId,
    public readonly merchantId: MerchantId,
    public readonly targetSegment: string,
    public readonly startDate: Date
  ) {}
}

// События от sku-management модуля
export class SKUUpdatedEvent {
  constructor(
    public readonly skuId: SkuId,
    public readonly changes: {
      price?: number;
      inventory?: number;
      availability?: boolean;
      region?: string;
    },
    public readonly timestamp: Date
  ) {}
}

export class SKUPriceChangedEvent {
  constructor(
    public readonly skuId: SkuId,
    public readonly oldPrice: Price,
    public readonly newPrice: Price,
    public readonly changedAt: Date
  ) {}
}

// События от analytics модуля
export class MetricsUpdatedEvent {
  constructor(
    public readonly moduleId: string,
    public readonly metrics: Metrics,
    public readonly updatedAt: Date
  ) {}
}

export class ReportGeneratedEvent {
  constructor(
    public readonly reportId: ReportId,
    public readonly reportType: ReportType,
    public readonly generatedAt: Date
  ) {}
}

// События от promo-management модуля
export class PromoActivatedEvent {
  constructor(
    public readonly promoId: PromoId,
    public readonly campaignId: CampaignId,
    public readonly discountPercent: number,
    public readonly activatedAt: Date
  ) {}
}

export class PromoCodeUsedEvent {
  constructor(
    public readonly promoCode: PromoCode,
    public readonly playerId: PlayerId,
    public readonly discountAmount: number,
    public readonly usedAt: Date
  ) {}
}

// События от ui-builder модуля
export class ThemeAppliedEvent {
  constructor(
    public readonly themeId: ThemeId,
    public readonly playerId: PlayerId,
    public readonly appliedAt: Date
  ) {}
}

// События от rewards-system модуля
export class RewardClaimedEvent {
  constructor(
    public readonly playerId: PlayerId,
    public readonly rewardId: RewardId,
    public readonly rewardValue: number,
    public readonly claimedAt: Date
  ) {}
}

export class LoyaltyTierUpgradedEvent {
  constructor(
    public readonly playerId: PlayerId,
    public readonly oldTier: LoyaltyTier,
    public readonly newTier: LoyaltyTier,
    public readonly upgradedAt: Date
  ) {}
}

// События от personalization-engine модуля
export class OfferGeneratedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly offerId: OfferId,
    public readonly discount: number,
    public readonly expiresAt: Date,
    public readonly source: 'personalization-engine'
  ) {}
}

export class PlayerBehaviorAnalyzedEvent {
  constructor(
    public readonly playerId: UserId,
    public readonly segment: string,
    public readonly riskScore: number,
    public readonly recommendations: string[],
    public readonly timestamp: Date
  ) {}
}

// События от webshop-experience модуля
export class ProductPurchasedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly productId: SkuId,
    public readonly amount: number,
    public readonly timestamp: Date,
    public readonly paymentMethod: string
  ) {}
}

export class PromoCodeUsedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly promoCode: string,
    public readonly discount: number,
    public readonly timestamp: Date
  ) {}
}
```

### Application Services для межмодульного взаимодействия

```typescript
// Каждый модуль экспортирует Application Service
// campaign-management/application/services/campaign-management.service.ts
export interface CampaignManagementServicePort {
  getCampaignById(id: CampaignId): Promise<Result<Campaign, Error>>;
  getActiveCampaigns(): Promise<Result<Campaign[], Error>>;
  createCampaign(campaignData: CreateCampaignInput): Promise<Result<Campaign, Error>>;
  activateCampaign(id: CampaignId): Promise<Result<void, Error>>;
}

// sku-management/application/services/sku-management.service.ts
export interface SKUManagementServicePort {
  getSKUById(id: SkuId): Promise<Result<SKU, Error>>;
  getSKUInventory(id: SkuId): Promise<Result<Inventory, Error>>;
  updateSKUPrice(id: SkuId, price: Price): Promise<Result<void, Error>>;
  updateInventory(id: SkuId, quantity: number): Promise<Result<void, Error>>;
}

// analytics/application/services/analytics.service.ts
export interface AnalyticsServicePort {
  getMetrics(moduleId: string, timeRange: TimeRange): Promise<Result<Metrics, Error>>;
  generateReport(reportType: ReportType): Promise<Result<Report, Error>>;
  predictTrends(data: TrendData): Promise<Result<TrendPrediction, Error>>;
  calculateKPIs(moduleId: string): Promise<Result<KPI[], Error>>;
}

// promo-management/application/services/promo-management.service.ts
export interface PromoManagementServicePort {
  getPromoById(id: PromoId): Promise<Result<Promo, Error>>;
  validatePromoCode(code: PromoCode): Promise<Result<PromoValidation, Error>>;
  activatePromo(id: PromoId): Promise<Result<void, Error>>;
  createPromo(promoData: CreatePromoInput): Promise<Result<Promo, Error>>;
}

// rewards-system/application/services/rewards-system.service.ts
export interface RewardsSystemServicePort {
  getPlayerRewards(playerId: PlayerId): Promise<Result<Reward[], Error>>;
  claimReward(playerId: PlayerId, rewardId: RewardId): Promise<Result<RewardClaim, Error>>;
  calculateLoyaltyTier(playerId: PlayerId): Promise<Result<LoyaltyTier, Error>>;
  updateLoyaltyPoints(playerId: PlayerId, points: number): Promise<Result<void, Error>>;
}

// Использование в других модулях
// personalization-engine/application/use-cases/generate-offer.use-case.ts
@injectable()
export class GenerateOfferUseCase {
  constructor(
    @inject(TYPES.CampaignManagementService)
    private readonly _campaignService: CampaignManagementServicePort,
    @inject(TYPES.SKUManagementService)
    private readonly _skuService: SKUManagementServicePort,
    @inject(TYPES.AnalyticsService)
    private readonly _analyticsService: AnalyticsServicePort
  ) {}
}
```

### Интеграционные потоки

#### Внутри модуля (прямые вызовы UseCase → Repository):
1. **Создание кампании** → `CreateCampaignUseCase` → `CampaignRepository` (прямой вызов)
2. **Обновление SKU** → `UpdateSKUUseCase` → `SKURepository` (прямой вызов)
3. **Активация промо** → `ActivatePromoUseCase` → `PromoRepository` (прямой вызов)
4. **Создание темы** → `CreateThemeUseCase` → `ThemeRepository` (прямой вызов)
5. **Расчет метрик** → `CalculateMetricsUseCase` → `AnalyticsRepository` (прямой вызов)
6. **Получение награды** → `ClaimRewardUseCase` → `RewardRepository` (прямой вызов)
7. **Публикация контента** → `PublishContentUseCase` → `ContentRepository` (прямой вызов)
8. **Перевод контента** → `TranslateContentUseCase` → `TranslationRepository` (прямой вызов)

#### Между модулями (EventBus + Application Services):
1. **Пользователь регистрируется** → `authentication` → `UserRegisteredEvent` → `personalization-engine` (создание профиля)
2. **Мерчант создает кампанию** → `campaign-management` → `CampaignCreatedEvent` → `analytics` (отслеживание)
3. **Цена товара изменилась** → `sku-management` → `SKUPriceChangedEvent` → `analytics` (обновление метрик)
4. **Промо активировано** → `promo-management` → `PromoActivatedEvent` → `campaign-management` (уведомление)
5. **Награда получена** → `rewards-system` → `RewardClaimedEvent` → `analytics` (отслеживание активности)
6. **Тема применена** → `ui-builder` → `ThemeAppliedEvent` → `webshop-experience` (обновление интерфейса)
7. **Пользователь просматривает товары** → `webshop-experience` → `personalization-engine.service` (через Application Service)
8. **Покупка совершена** → `webshop-experience` → `ProductPurchasedEvent` → `analytics` (обновление данных)
9. **AI анализирует поведение** → `personalization-engine` → `PlayerBehaviorAnalyzedEvent` → `analytics` (обмен данными)
10. **Персонализация предложений** → `personalization-engine` → `OfferGeneratedEvent` → `promo-management` (создание офферов)
11. **Игра интегрирует SDK** → `sdk-integration` → `authentication.service` (через Application Service)
12. **Mobile app открывает магазин** → `sdk-integration` → `webshop-experience.service` (через Application Service)

## 🔄 Рефакторинг архитектуры

### Проблемы предыдущей архитектуры

#### ❌ Нарушение принципов DDD:
- **Merchant Admin Panel** содержал 6 разных доменов в одном модуле
- **Webshop Experience** смешивал бизнес-логику и технические аспекты
- **Нечеткие границы контекстов** между модулями
- **Смешанная ответственность** в одном модуле

#### ❌ Нарушение принципов Clean Architecture:
- **Domain Layer** содержал сущности разных доменов
- **Application Layer** смешивал Use Cases разных контекстов
- **Interface Adapters** содержали презентеры для разных доменов
- **Сложность тестирования** из-за смешанной ответственности

### Решение: Правильная архитектура

#### ✅ Правильные Bounded Contexts:
1. **campaign-management** - управление кампаниями
2. **sku-management** - управление товарами
3. **analytics** - аналитика и метрики
4. **promo-management** - управление промо
5. **ui-builder** - конструктор интерфейса
6. **merchant-dashboard** - дашборд мерчанта
7. **rewards-system** - система наград
8. **content-management** - управление контентом
9. **localization** - локализация
10. **personalization-engine** - AI персонализация
11. **webshop-experience** - пользовательский опыт
12. **authentication** - аутентификация
13. **sdk-integration** - SDK интеграции

#### ✅ Преимущества новой архитектуры:
- **Четкие границы доменов** - каждый модуль отвечает за свой домен
- **Соответствие принципам DDD** - один модуль = один домен
- **Правильное использование Clean Architecture** - четкое разделение слоев
- **Четкое межмодульное взаимодействие** - через EventBus и Application Services
- **Простота тестирования** - изолированные модули
- **Высокая масштабируемость** - слабая связанность модулей
- **Легкость поддержки** - четкая ответственность каждого модуля

## Технологический стек

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - utility-first CSS фреймворк
- **Universal Components** - переиспользуемые UI компоненты

### Backend
- **Nest.js** - Node.js фреймворк с TypeScript
- **AWS Lambda** - serverless функции
- **API Gateway** - маршрутизация и авторизация
- **InversifyJS** - Dependency Injection

### AI & ML
- **Amazon SageMaker** - ML модели для персонализации
- **Amazon Personalize** - готовые рекомендации
- **Amazon Bedrock** - LLM для чат-ботов

### База данных
- **Amazon RDS (PostgreSQL)** - основная БД
- **Amazon ElastiCache (Redis)** - кэширование
- **Amazon DynamoDB** - NoSQL для аналитики

### Инфраструктура
- **AWS CDK** - Infrastructure as Code
- **AWS CloudWatch** - мониторинг
- **AWS X-Ray** - трейсинг
- **AWS Kinesis** - потоковая аналитика

## Принципы разработки

### Clean Architecture (Uncle Bob)
**Поток данных:**
- **Планирование:** Domain → Application → Infrastructure → Interface Adapters (сверху вниз)
- **Выполнение:** Interface Adapters → Application → Domain ← Infrastructure (снаружи внутрь)

**Слои архитектуры:**
- **Domain Layer** - бизнес-логика, сущности, Value Objects, доменные сервисы, события, ошибки
- **Application Layer** - Use Cases, порты (интерфейсы), Application Services
- **Infrastructure Layer** - репозитории, внешние сервисы, DI конфигурация
- **Interface Adapters** - Presenters (логика представления), Views (UI компоненты)

**Ключевые принципы:**
- **Dependency Inversion** - зависимости направлены внутрь
- **Result Pattern** - единообразная обработка ошибок
- **UseCase НЕ вызывает Domain напрямую** - только через порты
- **Domain создается и валидируется** - но не вызывается как сервис
- **Infrastructure реализует порты** - но вызывается через интерфейсы

### Domain-Driven Design
- **Bounded Contexts** - каждый модуль представляет отдельный bounded context
- **Четкие границы** между доменами
- **Event-Driven архитектура** для межмодульного общения
- **Application Services** для экспорта функциональности между модулями
- **Порты** определяют контракт взаимодействия

### Event-Driven Architecture
**EventBus используется ТОЛЬКО для межмодульного общения:**
- ✅ **Межмодульное общение** - модули реагируют на изменения в других модулях
- ❌ **НЕ используется внутри модуля** - UseCase → Repository (прямые вызовы)

**Типы событий:**
- **Синхронные** - критические операции, аудит, валидация
- **Асинхронные** - фоновые операции, уведомления, аналитика

### Документация и код
- **Модульная документация** - каждый подмодуль имеет отдельный файл документации
- **Соответствие архитектуре** - структура документации точно соответствует коду
- **Игровая тематика** - все примеры адаптированы под игровую индустрию
- **Пользовательские сценарии** - документация написана для бизнес-пользователей

### Quality Assurance
- **100% покрытие тестами** - Unit, Integration, Data Flow, E2E
- **Quality Monitor** - автоматическая проверка архитектуры
- **Result Pattern** - единообразная обработка ошибок
- **TypeScript** - строгая типизация
- **Clean Architecture валидация** - проверка соблюдения принципов
- **EventBus правильное использование** - только для межмодульного общения
- **Universal компоненты** - использование во всех View

## Развертывание

### AWS Architecture
```
Frontend (Next.js) → CloudFront → API Gateway → Lambda/Fargate
                                                      ↓
                                            RDS + ElastiCache
                                                      ↓
                                            SageMaker (AI)
                                                      ↓
                                            S3 (файлы/медиа)
```

### CI/CD Pipeline
- **GitHub Actions** - автоматическая сборка и тестирование
- **AWS CodePipeline** - развертывание в AWS
- **Docker** - контейнеризация приложений
- **Terraform** - управление инфраструктурой

## Мониторинг и аналитика

### Метрики производительности
- Время отклика API
- Пропускная способность
- Использование ресурсов
- Ошибки и исключения

### Бизнес-метрики
- Конверсия пользователей
- Средний чек
- Lifetime Value (LTV)
- Retention Rate

### AI/ML метрики
- Точность персонализации
- Эффективность рекомендаций
- A/B тестирование предложений
- ROI от AI-кампаний
