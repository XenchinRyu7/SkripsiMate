// API Route: Create Node Manually
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { projectId, type, title, position, description, parent_id } = await request.json();

    if (!projectId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Get current max order_index
    const { data: existingNodes } = await supabaseAdmin
      .from('nodes')
      .select('order_index, type, metadata')
      .eq('project_id', projectId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingNodes && existingNodes.length > 0 
      ? (existingNodes[0].order_index || 0) + 1 
      : 0;

    // For phases, calculate the next phaseIndex
    let phaseIndex: number | undefined;
    if (type === 'phase') {
      const { data: allPhases } = await supabaseAdmin
        .from('nodes')
        .select('metadata')
        .eq('project_id', projectId)
        .eq('type', 'phase');

      if (allPhases && allPhases.length > 0) {
        // Find the max phaseIndex
        const maxPhaseIndex = Math.max(
          ...allPhases.map(p => (p.metadata as any)?.phaseIndex || 0)
        );
        phaseIndex = maxPhaseIndex + 1;
      } else {
        phaseIndex = 0;
      }
    }

    // Create new node
    const newNode = {
      id: uuidv4(),
      project_id: projectId,
      title,
      description: description || '',
      type,
      level: type === 'phase' ? 1 : type === 'step' ? 2 : 3,
      parent_id: parent_id || null,
      order_index: nextOrderIndex,
      status: 'pending',
      priority: 'medium',
      position: position || { x: 100, y: 100 },
      metadata: {
        estimatedTime: '',
        progress: 0,
        createdManually: true,
        ...(type === 'phase' && phaseIndex !== undefined ? { phaseIndex } : {}),
      },
    };

    const { error: insertError } = await supabaseAdmin
      .from('nodes')
      .insert(newNode);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create node' },
        { status: 500 }
      );
    }

    // Fetch all nodes for this project
    const { data: allNodes, error: fetchError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch nodes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nodes: allNodes,
      newNode,
    });
  } catch (error: any) {
    console.error('Error creating node:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

