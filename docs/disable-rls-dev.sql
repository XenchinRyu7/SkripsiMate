-- ============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ============================================
-- Run this in Supabase SQL Editor for development/testing
-- ⚠️ WARNING: Do NOT use in production!

-- Disable Row Level Security on all tables
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE edges DISABLE ROW LEVEL SECURITY;
ALTER TABLE node_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('projects', 'nodes', 'edges', 'node_embeddings', 'chat_messages');

-- Expected output: All "RLS Enabled" should be FALSE

