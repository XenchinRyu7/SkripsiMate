// API Route: Debug Project - Show Raw Data
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Get ALL nodes with details
    const { data: allNodes, error: nodesError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('type', { ascending: true })
      .order('order_index', { ascending: true });

    if (nodesError) {
      console.error('Error fetching nodes:', nodesError);
      return NextResponse.json({ error: nodesError.message }, { status: 500 });
    }

    // Organize by type and status
    const phases = allNodes?.filter(n => n.type === 'phase') || [];
    const steps = allNodes?.filter(n => n.type === 'step') || [];
    const substeps = allNodes?.filter(n => n.type === 'substep') || [];

    const breakdown = {
      phases: {
        total: phases.length,
        pending: phases.filter(n => n.status === 'pending').length,
        in_progress: phases.filter(n => n.status === 'in_progress').length,
        completed: phases.filter(n => n.status === 'completed').length,
        blocked: phases.filter(n => n.status === 'blocked').length,
      },
      steps: {
        total: steps.length,
        pending: steps.filter(n => n.status === 'pending').length,
        in_progress: steps.filter(n => n.status === 'in_progress').length,
        completed: steps.filter(n => n.status === 'completed').length,
        blocked: steps.filter(n => n.status === 'blocked').length,
      },
      substeps: {
        total: substeps.length,
        pending: substeps.filter(n => n.status === 'pending').length,
        in_progress: substeps.filter(n => n.status === 'in_progress').length,
        completed: substeps.filter(n => n.status === 'completed').length,
        blocked: substeps.filter(n => n.status === 'blocked').length,
      },
    };

    // Calculate progress (count ALL nodes including phases)
    const totalWork = allNodes?.length || 0;
    const completedWork = allNodes?.filter(n => n.status === 'completed').length || 0;
    const progressPercentage = totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0;

    // Find incomplete nodes (ALL types, not just steps/substeps)
    const incompleteNodes = allNodes?.filter(n => 
      n.status !== 'completed'
    ).map(n => ({
      id: n.id,
      title: n.title,
      type: n.type,
      status: n.status,
      parent_id: n.parent_id,
    })) || [];

    return NextResponse.json({
      success: true,
      summary: {
        totalNodes: allNodes?.length || 0,
        totalWork,
        completedWork,
        progressPercentage,
      },
      breakdown,
      incompleteNodes,
      rawNodeIds: allNodes?.map(n => ({ id: n.id, title: n.title, type: n.type, status: n.status })),
    });
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

