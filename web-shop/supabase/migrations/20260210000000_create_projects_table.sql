-- Migration: Create projects table
-- Created: 2026-02-10
-- Description: Table for storing merchant projects

-- Create projects table for storing project configurations
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    merchant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(app_id) -- Each app_id should be unique across all projects
);

-- Create index for faster lookups by merchant_id
CREATE INDEX IF NOT EXISTS idx_projects_merchant_id ON projects(merchant_id);

-- Create index for faster lookups by app_id
CREATE INDEX IF NOT EXISTS idx_projects_app_id ON projects(app_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Add unique constraint for app_id (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_app_id_unique') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_app_id_unique UNIQUE (app_id);
    END IF;
END $$;

-- Insert a test project for the demo merchant
INSERT INTO projects (id, app_id, name, description, status, merchant_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'test-app-001',
    'Demo Store',
    'A demo e-commerce store for testing',
    'active',
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;