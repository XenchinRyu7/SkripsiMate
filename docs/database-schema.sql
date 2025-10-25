-- ============================================
-- SKRIPSIMATE DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLES
-- ============================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  timeline TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('phase', 'step', 'substep', 'checklist')),
  level INTEGER NOT NULL,
  parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  position JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Edges table (for React Flow connections)
CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  from_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'dependency' CHECK (type IN ('dependency', 'sequence', 'related')),
  label TEXT,
  style JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Node embeddings table (for RAG/Vector Search)
CREATE TABLE IF NOT EXISTS node_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding VECTOR(1536), -- Gemini embedding dimension
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table (optional, for chat history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Nodes indexes
CREATE INDEX IF NOT EXISTS idx_nodes_project_id ON nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_order ON nodes(order_index);

-- Edges indexes
CREATE INDEX IF NOT EXISTS idx_edges_project_id ON edges(project_id);
CREATE INDEX IF NOT EXISTS idx_edges_from_node ON edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_to_node ON edges(to_node_id);

-- Node embeddings indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_project_id ON node_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_node_id ON node_embeddings(node_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_hash ON node_embeddings(content_hash);

-- Vector similarity search index (HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
ON node_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- Nodes RLS policies (inherit from projects)
CREATE POLICY "Users can view nodes of their projects"
  ON nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = nodes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert nodes to their projects"
  ON nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = nodes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can update nodes of their projects"
  ON nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = nodes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can delete nodes of their projects"
  ON nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = nodes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- Edges RLS policies (same as nodes)
CREATE POLICY "Users can manage edges of their projects"
  ON edges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = edges.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- Node embeddings RLS policies (same as nodes)
CREATE POLICY "Users can manage embeddings of their projects"
  ON node_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = node_embeddings.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- Chat messages RLS policies
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (
    user_id = auth.uid()::TEXT OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chat_messages.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert chat messages to their projects"
  ON chat_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid()::TEXT AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chat_messages.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embeddings_updated_at
  BEFORE UPDATE ON node_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_nodes(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  project_id_filter UUID
)
RETURNS TABLE (
  id UUID,
  node_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    node_embeddings.id,
    node_embeddings.node_id,
    node_embeddings.content,
    1 - (node_embeddings.embedding <=> query_embedding) AS similarity
  FROM node_embeddings
  WHERE 
    node_embeddings.project_id = project_id_filter
    AND 1 - (node_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY node_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- SAMPLE DATA (Optional, for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO projects (user_id, title, jurusan, timeline, description, metadata) VALUES
('test-user-id', 'Stock Prediction with Machine Learning', 'Teknik Informatika', '6 months', 'Prediksi harga saham menggunakan LSTM', 
 '{"currentPhase": "Phase 1", "totalSteps": 30, "completedSteps": 0, "progressPercentage": 0}'::JSONB);
*/

-- ============================================
-- DONE!
-- ============================================

-- Verify tables created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) AS column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Output: You should see: chat_messages, edges, node_embeddings, nodes, projects

