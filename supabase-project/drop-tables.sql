-- Drop all tables in correct order (respecting foreign key constraints)
-- Execute this in Supabase Studio: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop extensions (if not used elsewhere)
-- DROP EXTENSION IF EXISTS "uuid-ossp";
