# Миграция данных между Supabase проектами

## Обзор

Скрипты для переноса данных из проекта `qosblydpgejtnyvzctpg` в `syumvakzattjoufuvyzm`.

## Найденные данные

- ✅ **364 записи** в **14 таблицах**:
  - app_configs: 9
  - page_configs: 9
  - templates: 1
  - products: 39
  - offer_scenarios: 46
  - offer_engine_rules: 1
  - users: 52
  - user_offer_context: 39
  - transaction_log: 6
  - daily_rewards: 38
  - daily_reward_claims: 5
  - languages: 17
  - translations: 100
  - projects: 2

## Способы выполнения миграции

### Способ 1: Автоматическая миграция (требует Service Role Key)

1. Получите Service Role Key для целевого проекта:
   - Откройте: https://supabase.com/dashboard/project/syumvakzattjoufuvyzm/settings/api
   - Скопируйте `service_role` key (секретный ключ)

2. Установите переменную окружения:
   ```bash
   export TARGET_SUPABASE_SERVICE_KEY="your-service-role-key"
   ```

3. Запустите миграцию:
   ```bash
   npm run migrate:data
   # или
   node scripts/migrate-complete.js
   ```

### Способ 2: Проверка данных (без ключа)

Запустите скрипт для проверки данных в исходном проекте:
```bash
node scripts/migrate-all-data.js
```

Этот скрипт покажет все доступные данные, но не выполнит миграцию без Service Role Key.

## Скрипты

- `migrate-all-data.js` - Проверка и подготовка данных (не требует ключа)
- `migrate-complete.js` - Полная автоматическая миграция (требует TARGET_SUPABASE_SERVICE_KEY)
- `migrate-data-between-projects.js` - Альтернативный скрипт миграции

## Важно

⚠️ **Перед миграцией убедитесь, что:**
1. Все таблицы созданы в целевом проекте (применены миграции)
2. У вас есть Service Role Key для целевого проекта
3. Вы сделали backup целевого проекта (если там есть важные данные)

## После миграции

Проверьте данные в целевом проекте через Supabase Dashboard или выполните запросы для проверки количества записей в каждой таблице.


