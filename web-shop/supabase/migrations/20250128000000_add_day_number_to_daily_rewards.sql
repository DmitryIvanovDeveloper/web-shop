-- Migration: Add day_number to daily_rewards table
-- Created: 2025-01-28
-- Description: Adds day_number field to support rewards for specific days (DAY 1, DAY 2, etc.)

-- Add day_number column to daily_rewards table
ALTER TABLE daily_rewards 
ADD COLUMN IF NOT EXISTS day_number INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN daily_rewards.day_number IS 'Day number for this reward (1, 2, 3, etc.). NULL means reward is not day-specific.';

-- Create index for day_number lookups
CREATE INDEX IF NOT EXISTS idx_daily_rewards_day_number ON daily_rewards(day_number);

-- Create composite index for app_id and day_number queries
CREATE INDEX IF NOT EXISTS idx_daily_rewards_app_day ON daily_rewards(app_id, day_number);

-- Update unique constraint to include day_number (allow same title for different days)
-- First, drop the old constraint if it exists
ALTER TABLE daily_rewards 
DROP CONSTRAINT IF EXISTS daily_rewards_app_id_title_key;

-- Add new unique constraint: app_id + day_number (if day_number is not null) or app_id + title (if day_number is null)
-- Note: PostgreSQL doesn't support conditional unique constraints directly, so we'll use a unique index
CREATE UNIQUE INDEX IF NOT EXISTS daily_rewards_app_day_unique 
ON daily_rewards(app_id, day_number) 
WHERE day_number IS NOT NULL;

-- Keep unique constraint for app_id + title when day_number is NULL
CREATE UNIQUE INDEX IF NOT EXISTS daily_rewards_app_title_unique 
ON daily_rewards(app_id, title) 
WHERE day_number IS NULL;

-- Update existing sample reward to have day_number = 1
UPDATE daily_rewards 
SET day_number = 1 
WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND day_number IS NULL;

