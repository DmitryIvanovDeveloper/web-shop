-- ============================================================================
-- Database Setup for Hybrid Payment Recording
-- ============================================================================
-- This SQL script ensures the transaction_log table has proper constraints
-- for hybrid payment recording (Client-Side + Stripe Webhook)
-- ============================================================================

-- 1. Verify existing constraints
-- Run this to check if UNIQUE constraint already exists
SELECT 
  constraint_name, 
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'transaction_log' 
  AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%stripe_payment_intent_id%';

-- Expected result: 
-- transaction_log_stripe_payment_intent_id_key | UNIQUE | transaction_log


-- 2. Add UNIQUE constraint if missing
-- This prevents duplicate transactions when both Client-Side and Webhook save
-- Only run if the constraint doesn't exist
ALTER TABLE transaction_log 
ADD CONSTRAINT transaction_log_stripe_payment_intent_id_key 
UNIQUE (stripe_payment_intent_id);

-- Note: If constraint already exists, you'll get error:
-- ERROR: constraint "transaction_log_stripe_payment_intent_id_key" already exists
-- This is OK - it means the constraint is already in place


-- 3. Verify table structure
-- Run this to check all columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transaction_log'
ORDER BY ordinal_position;

-- Expected columns:
-- id                           | bigint              | NO
-- user_id                      | uuid                | NO
-- app_id                       | text                | YES
-- product_id                   | text                | NO
-- merchant_id                  | text                | YES
-- paid_amount                  | numeric             | NO
-- stripe_payment_intent_id     | text                | YES  ← Should be here
-- payment_status               | text                | NO
-- payment_method               | text                | NO
-- created_at                   | timestamp           | YES
-- updated_at                   | timestamp           | YES


-- 4. Verify RLS policies (for Supabase Realtime)
-- Run this to check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'transaction_log';

-- For Realtime subscriptions to work, you need SELECT policy:
-- Example policy (adjust based on your auth requirements):

-- Allow anonymous users to SELECT their own transactions (for Realtime)
CREATE POLICY "Users can view own transactions"
ON transaction_log
FOR SELECT
USING (true); -- Mobile app will filter by user_id in Realtime subscription

-- Allow service role to INSERT (for webhook)
-- Note: Webhook should use service_role key, not anon key


-- 5. Test duplicate handling
-- Run this to test that duplicates are properly rejected
INSERT INTO transaction_log (
  user_id,
  app_id,
  product_id,
  paid_amount,
  stripe_payment_intent_id,
  payment_status,
  payment_method
) VALUES (
  'f47a88f5-80be-4963-9de5-c6a6ba847809', -- Example UUID
  'APP123',
  'test-product',
  99.99,
  'pi_test_duplicate_check', -- Test payment intent ID
  'succeeded',
  'stripe'
);

-- Try inserting again - should fail with error code 23505
INSERT INTO transaction_log (
  user_id,
  app_id,
  product_id,
  paid_amount,
  stripe_payment_intent_id,
  payment_status,
  payment_method
) VALUES (
  'f47a88f5-80be-4963-9de5-c6a6ba847809',
  'APP123',
  'test-product',
  99.99,
  'pi_test_duplicate_check', -- Same payment intent ID
  'succeeded',
  'stripe'
);

-- Expected error:
-- ERROR: duplicate key value violates unique constraint "transaction_log_stripe_payment_intent_id_key"
-- DETAIL: Key (stripe_payment_intent_id)=(pi_test_duplicate_check) already exists.

-- Clean up test data
DELETE FROM transaction_log 
WHERE stripe_payment_intent_id = 'pi_test_duplicate_check';


-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. UNIQUE constraint on stripe_payment_intent_id is CRITICAL for hybrid approach
-- 2. Without it, you'll get duplicate transactions in the database
-- 3. The application handles error code 23505 gracefully (not an error, just duplicate)
-- 4. Supabase Realtime will only trigger once (on first INSERT, not on duplicate)
-- ============================================================================

