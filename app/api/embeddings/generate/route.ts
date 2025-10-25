// API Route: Generate Embeddings
import { NextRequest, NextResponse } from 'next/server';
import { embedText } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Note: Using Node.js runtime (not Edge) because crypto module is needed
export const runtime = 'nodejs';

interface EmbeddingRequest {
  projectId: string;
  nodeId: string;
}

// Generate content hash for change detection
function generateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Combine node data into single text for embedding
function buildEmbeddingContent(node: any): string {
  const parts = [
    `Title: ${node.title}`,
    node.description ? `Description: ${node.description}` : '',
    `Type: ${node.type}`,
    `Priority: ${node.priority}`,
    `Status: ${node.status}`,
  ];

  // Add metadata if available
  const metadata = node.metadata || {};
  if (metadata.estimatedTime) {
    parts.push(`Estimated Time: ${metadata.estimatedTime}`);
  }
  if (metadata.checkpoints) {
    parts.push(`Checkpoints: ${metadata.checkpoints.join(', ')}`);
  }
  if (metadata.tips) {
    parts.push(`Tips: ${metadata.tips.join(', ')}`);
  }

  return parts.filter(Boolean).join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: EmbeddingRequest = await request.json();
    const { projectId, nodeId } = body;

    // Fetch node
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    // Build embedding content
    const content = buildEmbeddingContent(node);
    const contentHash = generateHash(content);

    // Check if embedding already exists with same hash
    const { data: existingEmbedding } = await supabase
      .from('node_embeddings')
      .select('*')
      .eq('node_id', nodeId)
      .eq('content_hash', contentHash)
      .single();

    if (existingEmbedding) {
      return NextResponse.json({
        success: true,
        message: 'Embedding already up to date',
        embedding: existingEmbedding,
      });
    }

    // Generate new embedding
    console.log(`Generating embedding for node: ${node.title}`);
    const embeddingVector = await embedText(content);

    // Delete old embeddings for this node
    await supabase
      .from('node_embeddings')
      .delete()
      .eq('node_id', nodeId);

    // Insert new embedding
    const { data: newEmbedding, error: insertError } = await supabase
      .from('node_embeddings')
      .insert({
        project_id: projectId,
        node_id: nodeId,
        content: content,
        content_hash: contentHash,
        embedding: embeddingVector,
        metadata: {
          type: node.type,
          level: node.level,
          status: node.status,
          priority: node.priority,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      embedding: newEmbedding,
    });
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate embedding',
      },
      { status: 500 }
    );
  }
}

