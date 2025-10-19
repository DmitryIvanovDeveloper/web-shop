# GitHub Actions для Web Shop Client

Этот проект настроен с автоматической сборкой и тестированием через GitHub Actions.

## Workflows

### 1. WebShop Client CI (Continuous Integration)
**Файл:** `.github/workflows/webshop-client.yml`
- **Триггеры:** Push и Pull Request на `main` и `develop`
- **Действия:**
  - Установка зависимостей
  - Линтинг кода
  - Запуск тестов
  - Сборка приложения
  - Проверка результата сборки

### 2. Develop Branch CI
**Файл:** `.github/workflows/develop.yml`
- **Триггеры:** Push и Pull Request на `develop`
- **Действия:**
  - Полный цикл CI/CD
  - Загрузка артефактов сборки
  - Комментирование PR с результатами

### 3. Build and Deploy
**Файл:** `.github/workflows/build.yml`
- **Триггеры:** Push на `main` и `develop`
- **Действия:**
  - Тестирование на Node.js 18.x и 20.x
  - Автоматический деплой на Vercel (только для `main`)

## Требования

### Secrets (для деплоя на Vercel)
Добавьте в настройки репозитория:
- `VERCEL_TOKEN` - токен Vercel
- `ORG_ID` - ID организации Vercel
- `PROJECT_ID` - ID проекта Vercel

## Команды

```bash
# Локальная разработка
npm run dev

# Сборка
npm run build

# Тесты
npm test

# Линтинг
npm run lint
```

## Структура проекта

- **Карточки товаров:** 270x400px
- **Grid layout:** автоматические колонки
- **Sidebar:** 58px (левый), 230px (правый)
- **Popup авторизации:** Pixel Gun 3D стиль

## Особенности

- ✅ Автоматическая сборка при каждом push
- ✅ Тестирование на разных версиях Node.js
- ✅ Загрузка артефактов сборки
- ✅ Автоматический деплой на production
- ✅ Комментирование Pull Request'ов
