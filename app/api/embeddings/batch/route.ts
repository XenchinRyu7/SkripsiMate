// API Route: Batch Generate Embeddings
import { NextRequest, NextResponse } from 'next/server';
import { embedText } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Note: Using Node.js runtime (not Edge) because crypto module is needed
export const runtime = 'nodejs';

interface BatchEmbeddingRequest {
  projectId: string;
  nodeIds?: string[]; // If empty, embed all nodes in project
}

function generateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

function buildEmbeddingContent(node: any): string {
  const parts = [
    `Title: ${node.title}`,
    node.description ? `Description: ${node.description}` : '',
    `Type: ${node.type}`,
    `Priority: ${node.priority}`,
    `Status: ${node.status}`,
  ];

  const metadata = node.metadata || {};
  if (metadata.estimatedTime) {
    parts.push(`Estimated Time: ${metadata.estimatedTime}`);
  }
  if (metadata.checkpoints) {
    parts.push(`Checkpoints: ${metadata.checkpoints.join(', ')}`);
  }

  return parts.filter(Boolean).join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchEmbeddingRequest = await request.json();
    const { projectId, nodeIds } = body;

    // Fetch nodes
    let query = supabase
      .from('nodes')
      .select('*')
      .eq('project_id', projectId);

    if (nodeIds && nodeIds.length > 0) {
      query = query.in('id', nodeIds);
    }

    const { data: nodes, error: nodesError } = await query;

    if (nodesError) throw nodesError;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No nodes to embed',
        count: 0,
      });
    }

    console.log(`Batch embedding ${nodes.length} nodes...`);

    // Generate embeddings for all nodes
    const embeddingPromises = nodes.map(async (node) => {
      const content = buildEmbeddingContent(node);
      const contentHash = generateHash(content);

      // Check if already embedded
      const { data: existing } = await supabase
        .from('node_embeddings')
        .select('id')
        .eq('node_id', node.id)
        .eq('content_hash', contentHash)
        .single();

      if (existing) {
        return { nodeId: node.id, status: 'skipped', reason: 'already embedded' };
      }

      try {
        // Generate embedding
        const embeddingVector = await embedText(content);

        // Delete old embedding
        await supabase
          .from('node_embeddings')
          .delete()
          .eq('node_id', node.id);

        // Insert new embedding
        await supabase
          .from('node_embeddings')
          .insert({
            project_id: projectId,
            node_id: node.id,
            content: content,
            content_hash: contentHash,
            embedding: embeddingVector,
            metadata: {
              type: node.type,
              level: node.level,
              status: node.status,
              priority: node.priority,
            },
          });

        return { nodeId: node.id, status: 'success' };
      } catch (error: any) {
        console.error(`Error embedding node ${node.id}:`, error);
        return { nodeId: node.id, status: 'error', error: error.message };
      }
    });

    const results = await Promise.all(embeddingPromises);

    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: nodes.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
    });
  } catch (error: any) {
    console.error('Error in batch embedding:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate batch embeddings',
      },
      { status: 500 }
    );
  }
}

