// API Route: Update Node Status with Cascade Logic
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nodeId } = await params;
    const { status } = await request.json();

    if (!status || !['pending', 'in_progress', 'completed', 'blocked'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Get the node being updated
    const { data: node, error: nodeError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError || !node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    // Update the node status
    const { error: updateError } = await supabaseAdmin
      .from('nodes')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nodeId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    // CASCADE LOGIC: Update parent nodes if all children are completed
    await cascadeStatusUpdate(node.project_id);

    // Fetch all updated nodes for this project
    const { data: allNodes, error: fetchError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('project_id', node.project_id)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated nodes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nodes: allNodes,
      message: 'Status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating node status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function: Cascade status updates from children to parents
async function cascadeStatusUpdate(projectId: string) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return;
  }

  // Get all nodes for the project
  const { data: allNodes, error } = await supabaseAdmin
    .from('nodes')
    .select('*')
    .eq('project_id', projectId);

  if (error || !allNodes) {
    console.error('Failed to fetch nodes for cascade:', error);
    return;
  }

  // Update steps based on their substeps
  const steps = allNodes.filter(n => n.type === 'step');
  for (const step of steps) {
    const substeps = allNodes.filter(n => n.parent_id === step.id && n.type === 'substep');
    
    if (substeps.length > 0) {
      const allCompleted = substeps.every(s => s.status === 'completed');
      const anyInProgress = substeps.some(s => s.status === 'in_progress');
      const anyBlocked = substeps.some(s => s.status === 'blocked');
      
      let newStatus = step.status;
      if (allCompleted) {
        newStatus = 'completed';
      } else if (anyBlocked) {
        newStatus = 'blocked';
      } else if (anyInProgress) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'pending';
      }
      
      // Update step status if changed
      if (newStatus !== step.status) {
        await supabaseAdmin
          .from('nodes')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', step.id);
      }
    }
  }

  // Update phases based on their steps
  const phases = allNodes.filter(n => n.type === 'phase');
  for (const phase of phases) {
    const phaseSteps = allNodes.filter(n => n.parent_id === phase.id && n.type === 'step');
    
    if (phaseSteps.length > 0) {
      const allCompleted = phaseSteps.every(s => s.status === 'completed');
      const anyInProgress = phaseSteps.some(s => s.status === 'in_progress');
      const anyBlocked = phaseSteps.some(s => s.status === 'blocked');
      
      let newStatus = phase.status;
      if (allCompleted) {
        newStatus = 'completed';
      } else if (anyBlocked) {
        newStatus = 'blocked';
      } else if (anyInProgress) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'pending';
      }
      
      // Update phase status if changed
      if (newStatus !== phase.status) {
        await supabaseAdmin
          .from('nodes')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', phase.id);
      }

      // Calculate and update progress
      const completedSteps = phaseSteps.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedSteps / phaseSteps.length) * 100);
      
      const currentMetadata = phase.metadata as any || {};
      await supabaseAdmin
        .from('nodes')
        .update({
          metadata: {
            ...currentMetadata,
            progress,
          },
        })
        .eq('id', phase.id);
    }
  }
}

