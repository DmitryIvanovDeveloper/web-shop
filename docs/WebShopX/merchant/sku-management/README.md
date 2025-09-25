# SKU Management - Модуль управления товарами

*Комплексная система для управления игровыми товарами, инвентарем и ценообразованием.*

---

## 🎯 Обзор модуля

Модуль SKU Management отвечает за полный цикл управления игровыми товарами - от создания новых скинов и оружия до отслеживания остатков и настройки региональных цен. Он обеспечивает эффективное управление каталогом товаров с учетом специфики игровой индустрии.

---

## 📁 Структура модуля

- [Create/Edit Products](Merchant%20Admin%20Panel%20-%20SKU%20management%20create%20edit%20products.csv) - Создание и редактирование товаров
- [Track Inventory](Merchant%20Admin%20Panel%20-%20SKU%20management%20track%20inventory.csv) - Отслеживание инвентаря  
- [Localize Pricing](Merchant%20Admin%20Panel%20-%20SKU%20management%20localize%20pricing.csv) - Локализация ценообразования

---

## 🔗 Архитектурные связи

- **Входящие данные:** Media Files, Currency Rates, Tax Data (из External Services)
- **Исходящие данные:** Product Catalog, Pricing Data, Inventory Status (в Webshop Experience, Analytics)
- **Зависимости:** Media Storage Service, Currency Exchange API, Tax Calculation Service, Analytics Module

---

## 🚀 Ключевые Use Cases

- `CreateEditProduct` - создание и редактирование игровых товаров
- `TrackInventory` - отслеживание товарных остатков в реальном времени
- `LocalizePricing` - настройка регионального ценообразования
- `ManageMediaContent` - управление медиа-ресурсами товаров
- `AnalyzeProductPerformance` - аналитика эффективности товаров

---

## 📈 Метрики эффективности

- **Product Creation Time** - время создания нового товара
- **Inventory Accuracy** - точность отслеживания остатков
- **Pricing Optimization** - эффективность ценовых стратегий
- **Media Load Performance** - производительность загрузки медиа
- **Regional Conversion Rates** - конверсия по регионам
