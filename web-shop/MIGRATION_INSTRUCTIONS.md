# Инструкции по настройке базы данных для функциональности publish

## Проблема
Запросы к Supabase таймаутят из-за отсутствия таблиц или неправильных RLS policies.

## Решение

### Шаг 1: Выполнить SQL миграцию

1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql
2. Скопируйте содержимое файла `supabase-migration.sql`
3. Вставьте в SQL Editor
4. Нажмите "Run" или выполните запрос

### Шаг 2: Проверить создание таблиц

После выполнения миграции проверьте, что таблицы созданы:
- `offer_scenarios` 
- `offer_engine_rules`

### Шаг 3: Проверить RLS policies

Убедитесь, что policies созданы:
- `Service role can manage offer_scenarios`
- `Service role can manage offer_engine_rules`
- `Authenticated users can read offer_scenarios`
- `Authenticated users can read offer_engine_rules`

### Шаг 4: Тестирование

После выполнения миграции функциональность publish должна работать корректно.

## Альтернативный вариант (если миграция не работает)

Если миграция через SQL Editor не работает, можно временно отключить RLS для тестирования:

```sql
ALTER TABLE public.offer_scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_engine_rules DISABLE ROW LEVEL SECURITY;
```

**Внимание:** Отключайте RLS только для тестирования! В продакшене обязательно используйте правильные policies.

