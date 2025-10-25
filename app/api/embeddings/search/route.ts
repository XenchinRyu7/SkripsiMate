// API Route: Vector Similarity Search
import { NextRequest, NextResponse } from 'next/server';
import { embedText } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

interface SearchRequest {
  projectId: string;
  query: string;
  matchThreshold?: number;
  matchCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const {
      projectId,
      query,
      matchThreshold = 0.7,
      matchCount = 5,
    } = body;

    // Generate embedding for query
    console.log(`Embedding search query: ${query}`);
    const queryEmbedding = await embedText(query);

    // Call Supabase RPC function for similarity search
    const { data, error } = await supabase.rpc('match_nodes', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      project_id_filter: projectId,
    });

    if (error) throw error;

    // Fetch full node details for matches
    const nodeIds = data.map((match: any) => match.node_id);
    
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .in('id', nodeIds);

    if (nodesError) throw nodesError;

    // Combine matches with node data
    const results = data.map((match: any) => {
      const node = nodes.find(n => n.id === match.node_id);
      return {
        ...match,
        node,
      };
    });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Error in vector search:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search',
      },
      { status: 500 }
    );
  }
}

