-- TEMPORARY FIX: Relax RLS for API operations
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/yoggzceatrrpsuameawn/sql/new)
-- ⚠️ This is for development only! Re-enable proper RLS in production.

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update nodes of their projects" ON nodes;
DROP POLICY IF EXISTS "Users can delete nodes of their projects" ON nodes;

-- Create more permissive policies (allowing anon key)
CREATE POLICY "Allow all node updates"
  ON nodes FOR UPDATE
  USING (true);

CREATE POLICY "Allow all node deletes"
  ON nodes FOR DELETE
  USING (true);

-- Also for projects table
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;

CREATE POLICY "Allow all project updates"
  ON projects FOR UPDATE
  USING (true);

