-- Create projects table for Supabase project qosblydpgejtnyvzctpg
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  merchant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_merchant_id ON public.projects(merchant_id);
CREATE INDEX IF NOT EXISTS idx_projects_app_id ON public.projects(app_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (adjust based on your authentication needs)
CREATE POLICY "Allow authenticated users full access to projects" ON public.projects
FOR ALL USING (auth.role() = 'authenticated');

-- Optional: Create a policy for service role (for API access)
CREATE POLICY "Allow service role full access to projects" ON public.projects
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
