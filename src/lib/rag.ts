// RAG (Retrieval-Augmented Generation) System
// Smart context retrieval with embeddings to save tokens

import { supabaseAdmin } from './supabase';
import { embedText } from './gemini';

interface Node {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  level: number;
  parent_id: string | null;
  metadata: any;
}

interface RAGContext {
  relevantNodes: Node[];
  allPhases: Node[];  // All project phases for structure overview
  projectSummary: string;
  totalNodes: number;
  completedNodes: number;
}

/**
 * STRATEGY: Lightweight RAG without running local models
 * 
 * 1. Use Gemini Embeddings (FREE 1500 req/day)
 * 2. Cache embeddings in Supabase (pgvector)
 * 3. Only query relevant nodes (semantic search)
 * 4. Compact context = less tokens!
 */

/**
 * Get or create embedding for text
 * Caches in Supabase to avoid re-computing
 */
export async function getOrCreateEmbedding(
  text: string,
  nodeId?: string,
  projectId?: string
): Promise<number[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin not configured');
  }

  // Check if embedding exists in cache
  if (nodeId) {
    const { data: cached } = await supabaseAdmin
      .from('node_embeddings')
      .select('embedding')
      .eq('node_id', nodeId)
      .single();

    if (cached?.embedding) {
      return cached.embedding;
    }
  }

  // Generate new embedding
  const embedding = await embedText(text);

  // Cache it if we have node/project info
  if (nodeId && projectId) {
    await supabaseAdmin.from('node_embeddings').insert({
      node_id: nodeId,
      project_id: projectId,
      content: text.substring(0, 500), // First 500 chars
      embedding: embedding,
    });
  }

  return embedding;
}

/**
 * Find most relevant nodes using vector similarity
 * This is the CORE of RAG - only retrieve what's needed!
 */
export async function findRelevantNodes(
  query: string,
  projectId: string,
  limit: number = 5
): Promise<Node[]> {
  if (!supabaseAdmin) {
    return [];
  }

  try {
    // Generate query embedding
    const queryEmbedding = await embedText(query);

    // Call Supabase RPC function for similarity search
    const { data: similarNodes, error } = await supabaseAdmin.rpc(
      'match_nodes',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7, // 70% similarity minimum
        match_count: limit,
        project_id_filter: projectId,
      }
    );

    if (error) {
      console.error('Error in similarity search:', error);
      // Fallback: return all nodes (limited)
      return await fallbackGetNodes(projectId, limit);
    }

    return similarNodes || [];
  } catch (error) {
    console.error('RAG error:', error);
    // Fallback
    return await fallbackGetNodes(projectId, limit);
  }
}

/**
 * Fallback: Get nodes without vector search
 * Used when embeddings not ready or error occurs
 */
async function fallbackGetNodes(
  projectId: string,
  limit: number
): Promise<Node[]> {
  if (!supabaseAdmin) return [];

  const { data: nodes } = await supabaseAdmin
    .from('nodes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
    .limit(limit);

  return (nodes as Node[]) || [];
}

/**
 * Build compact RAG context for AI
 * This saves MASSIVE amounts of tokens!
 */
export async function buildRAGContext(
  userQuery: string,
  projectId: string
): Promise<RAGContext> {
  if (!supabaseAdmin) {
    return {
      relevantNodes: [],
      allPhases: [],
      projectSummary: '',
      totalNodes: 0,
      completedNodes: 0,
    };
  }

  // Get project metadata
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('title, jurusan, timeline, metadata')
    .eq('id', projectId)
    .single();

  // Get stats (very lightweight query)
  const { data: stats } = await supabaseAdmin
    .from('nodes')
    .select('status')
    .eq('project_id', projectId);

  const totalNodes = stats?.length || 0;
  const completedNodes = stats?.filter(n => n.status === 'completed').length || 0;

  // Get ONLY relevant nodes (RAG magic here!)
  const relevantNodes = await findRelevantNodes(userQuery, projectId, 5);

  // ALSO get ALL phases for structure overview (so AI can always find phase IDs)
  const { data: phases } = await supabaseAdmin
    .from('nodes')
    .select('id, title, type, status, description, level, parent_id, metadata')
    .eq('project_id', projectId)
    .eq('type', 'phase')
    .order('order_index', { ascending: true });

  const metadata = project?.metadata as any;

  return {
    relevantNodes,
    allPhases: phases || [],
    projectSummary: `${project?.title} (${project?.jurusan}, ${project?.timeline})`,
    totalNodes,
    completedNodes,
  };
}

/**
 * Format RAG context for AI prompt
 * Super compact format to save tokens
 */
export function formatRAGContext(context: RAGContext): string {
  let formatted = `**Project:** ${context.projectSummary}\n`;
  formatted += `**Progress:** ${context.completedNodes}/${context.totalNodes} completed\n`;

  // ALWAYS show all phases for structure overview (AI needs phase IDs!)
  if (context.allPhases.length > 0) {
    formatted += `\n**Project Structure (All Phases):**\n`;
    context.allPhases.forEach((phase, i) => {
      const status =
        phase.status === 'completed'
          ? '✅'
          : phase.status === 'in_progress'
          ? '🔄'
          : '⏸️';
      formatted += `${i + 1}. ${status} Fase ${i + 1}: "${phase.title}" (ID: ${phase.id})\n`;
    });
  }

  if (context.relevantNodes.length > 0) {
    formatted += `\n**Most Relevant Tasks:**\n`;
    context.relevantNodes.forEach((node, i) => {
      const status =
        node.status === 'completed'
          ? '✅'
          : node.status === 'in_progress'
          ? '🔄'
          : '⏸️';
      // Include node ID and type for AI to use in actions
      formatted += `${i + 1}. ${status} [${node.type.toUpperCase()}] "${node.title}" (ID: ${node.id})\n`;
      if (node.description) {
        formatted += `   Description: ${node.description.substring(0, 100)}${node.description.length > 100 ? '...' : ''}\n`;
      }
    });
  }

  return formatted;
}

/**
 * Embed all nodes in a project (bulk operation)
 * Run this once when roadmap is generated
 */
export async function embedProjectNodes(projectId: string): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: nodes } = await supabaseAdmin
    .from('nodes')
    .select('*')
    .eq('project_id', projectId);

  if (!nodes || nodes.length === 0) return;

  console.log(`Embedding ${nodes.length} nodes for project ${projectId}...`);

  // Batch process (avoid rate limits)
  for (const node of nodes) {
    const text = `${node.title} ${node.description || ''}`;
    await getOrCreateEmbedding(text, node.id, projectId);
  }

  console.log('Embedding complete!');
}

/**
 * Check if embeddings exist for project
 */
export async function hasEmbeddings(projectId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data, count } = await supabaseAdmin
    .from('node_embeddings')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  return (count || 0) > 0;
}

