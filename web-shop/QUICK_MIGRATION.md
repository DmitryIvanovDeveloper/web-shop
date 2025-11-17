# Быстрая миграция через Supabase Dashboard

Из-за проблем с подключением через MCP, выполните миграцию вручную через веб-интерфейс:

## Шаг 1: Откройте SQL Editor
https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql/new

## Шаг 2: Скопируйте и выполните этот SQL:

```sql
-- Создание таблиц
CREATE TABLE IF NOT EXISTS public.offer_scenarios (
  app_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  priority INTEGER,
  tags TEXT[],
  configuration JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, slug)
);

CREATE TABLE IF NOT EXISTS public.offer_engine_rules (
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  rule_tree JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, version)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_offer_scenarios_app_id ON public.offer_scenarios(app_id);
CREATE INDEX IF NOT EXISTS idx_offer_engine_rules_app_id ON public.offer_engine_rules(app_id);

-- Включение RLS
ALTER TABLE public.offer_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_engine_rules ENABLE ROW LEVEL SECURITY;

-- Удаление старых policies (если есть)
DROP POLICY IF EXISTS "Service role can manage offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Service role can manage offer_engine_rules" ON public.offer_engine_rules;
DROP POLICY IF EXISTS "Authenticated users can read offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Authenticated users can read offer_engine_rules" ON public.offer_engine_rules;

-- Создание policies для service_role
CREATE POLICY "Service role can manage offer_scenarios"
  ON public.offer_scenarios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage offer_engine_rules"
  ON public.offer_engine_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Создание policies для authenticated users (read only)
CREATE POLICY "Authenticated users can read offer_scenarios"
  ON public.offer_scenarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read offer_engine_rules"
  ON public.offer_engine_rules
  FOR SELECT
  TO authenticated
  USING (true);
```

## Шаг 3: Нажмите "Run" или Ctrl+Enter

После выполнения миграции функциональность publish должна заработать!

