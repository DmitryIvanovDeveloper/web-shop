# Применение миграции для добавления day_number

## Быстрый способ

Запустите скрипт:

```bash
npm run migrate:day-number
```

или

```bash
node scripts/run-migration.js
```

Скрипт покажет SQL для миграции и инструкции по применению.

## Ручное применение

1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql/new
2. Скопируйте SQL из вывода скрипта или из файла:
   `supabase/migrations/20250128000000_add_day_number_to_daily_rewards.sql`
3. Вставьте SQL в SQL Editor
4. Нажмите "Run" (или Cmd/Ctrl + Enter)

## Проверка

После применения миграции, запустите скрипт снова - он проверит, что колонка `day_number` существует.

## Что делает миграция

- Добавляет колонку `day_number INTEGER` в таблицу `daily_rewards`
- Создает индексы для оптимизации запросов
- Обновляет уникальные ограничения для поддержки наград по дням
- Обновляет существующую тестовую награду

