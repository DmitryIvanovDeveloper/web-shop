-- Migration: Create daily rewards tables
-- Created: 2025-01-27
-- Description: Tables for daily rewards system (merchant CRUD + client claims)

-- Create daily_rewards table for storing reward configurations
CREATE TABLE IF NOT EXISTS daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('points', 'currency', 'item')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(app_id, title) -- Prevent duplicate reward titles per app
);

-- Create daily_reward_claims table for tracking user claims
CREATE TABLE IF NOT EXISTS daily_reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    reward_id UUID NOT NULL REFERENCES daily_rewards(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER NOT NULL CHECK (points_awarded > 0),

    -- Constraints
    UNIQUE(user_id, DATE(claimed_at)) -- One claim per user per day
);

-- Insert sample daily reward for testing
INSERT INTO daily_rewards (id, app_id, type, title, description, points, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'default-app',
    'points',
    'Daily Bonus',
    'Claim your daily points reward to boost your balance!',
    100,
    true
) ON CONFLICT (app_id, title) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE daily_rewards IS 'Stores daily reward configurations managed by merchants';
COMMENT ON TABLE daily_reward_claims IS 'Tracks user claims of daily rewards';

COMMENT ON COLUMN daily_rewards.type IS 'Reward type: points, currency, or item';
COMMENT ON COLUMN daily_rewards.points IS 'Number of points/currency awarded';
COMMENT ON COLUMN daily_rewards.is_active IS 'Whether this reward is currently available';

COMMENT ON COLUMN daily_reward_claims.claimed_at IS 'When the user claimed the reward';
COMMENT ON COLUMN daily_reward_claims.points_awarded IS 'Actual points awarded (may differ from reward config)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_rewards_app_id ON daily_rewards(app_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_active ON daily_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_app_active ON daily_rewards(app_id, is_active);

CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON daily_reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_reward_id ON daily_reward_claims(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_date ON daily_reward_claims(user_id, DATE(claimed_at));
CREATE INDEX IF NOT EXISTS idx_reward_claims_claimed_at ON daily_reward_claims(claimed_at);

-- Create updated_at trigger for daily_rewards
CREATE OR REPLACE FUNCTION update_daily_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS daily_rewards_updated_at_trigger
    BEFORE UPDATE ON daily_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_rewards_updated_at();




