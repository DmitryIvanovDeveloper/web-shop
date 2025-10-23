# 🚀 Быстрый старт - Подключение к Supabase

## ✅ API ключ настроен!

Anon ключ успешно добавлен в конфигурацию проекта.

## 🔄 Статус: Таблицы удалены

Все таблицы были удалены из проекта. Для восстановления выполните:

## 3 простых шага для подключения:

### Шаг 1: Тестирование подключения
```bash
# Проверка подключения к удаленному проекту
node test-connection.js
```

### Шаг 2: Восстановление таблиц

#### Вариант A: Через Supabase Studio
1. Перейдите в: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql
2. Выполните SQL из файла `setup-tables.sql`

#### Вариант B: Через CLI (если есть токен доступа)
```bash
# Авторизация в Supabase CLI
npx supabase login

# Подключение к проекту
npm run link

# Применение миграций к удаленному проекту
npm run migrate:remote
```

### Шаг 3: Проверка и запуск
```bash
# Генерация TypeScript типов
npm run generate:remote

# Тестирование API
node client-example.js
```

## Альтернативный способ (без CLI токена):

### Шаг 1: Проверка подключения
```bash
node test-connection.js
```

### Шаг 2: Создание таблиц через Studio
1. Перейдите в: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql
2. Выполните SQL из файла `setup-tables.sql`
3. Или создайте таблицы вручную по инструкции в README.md

### Шаг 3: Тестирование
```bash
node client-example.js
```

## Интеграция с существующими проектами

```bash
# Автоматическая настройка интеграции
npm run integrate
```

## Проверка подключения

```bash
# Запуск примера
node client-example.js
```

## Полезные команды

- `npm run setup` - показать инструкции по настройке
- `npm run integrate` - настроить интеграцию с другими проектами
- `npm run studio` - открыть Supabase Studio
- `npm run migrate:remote` - применить миграции к удаленному проекту

## Ссылки

- **Dashboard**: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg
- **API Docs**: https://supabase.com/docs
- **Studio**: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql
