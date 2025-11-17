-- Migration: Add last_active_at field to users table
-- This field tracks when the user was last active (logged in)
-- Used for calculating daysSinceLastActive for Win-Back Campaign offers

-- Add last_active_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Update existing users to have last_active_at = NOW() if it's NULL
    UPDATE public.users 
    SET last_active_at = NOW() 
    WHERE last_active_at IS NULL;
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_users_last_active_at 
    ON public.users(last_active_at);
    
    RAISE NOTICE 'Column last_active_at added to users table';
  ELSE
    RAISE NOTICE 'Column last_active_at already exists in users table';
  END IF;
END $$;

