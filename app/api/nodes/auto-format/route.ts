// API Route: Auto-format Node Positions
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Removed edge runtime - needs access to SUPABASE_SERVICE_ROLE_KEY

interface LayoutConfig {
  PHASE_SPACING_X: number;
  PHASE_START_X: number;
  PHASE_Y: number;
  STEP_START_Y: number;
  STEP_SPACING_Y: number;
  STEP_OFFSET_X: number;
  SUBSTEP_START_OFFSET_Y: number;
  SUBSTEP_SPACING_Y: number;
  SUBSTEP_OFFSET_X: number;
}

// Same layout config as generation
const LAYOUT: LayoutConfig = {
  PHASE_SPACING_X: 1200,
  PHASE_START_X: 100,
  PHASE_Y: 100,
  STEP_START_Y: 400,
  STEP_SPACING_Y: 100,
  STEP_OFFSET_X: 0,
  SUBSTEP_START_OFFSET_Y: 150,
  SUBSTEP_SPACING_Y: 100,
  SUBSTEP_OFFSET_X: 50,
};

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Fetch all nodes for the project
    const { data: nodes, error: fetchError } = await supabaseAdmin 
      .from('nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch nodes' },
        { status: 500 }
      );
    }

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'No nodes found for this project' },
        { status: 404 }
      );
    }

    // Organize nodes by type
    const phases = nodes.filter(n => n.type === 'phase').sort((a, b) => {
      const aIndex = (a.metadata as any)?.phaseIndex ?? a.order_index;
      const bIndex = (b.metadata as any)?.phaseIndex ?? b.order_index;
      return aIndex - bIndex;
    });

    const updates: Array<{ id: string; position: { x: number; y: number } }> = [];

    // Recalculate positions for each phase
    phases.forEach((phase, phaseIndex) => {
      const phaseX = LAYOUT.PHASE_START_X + (phaseIndex * LAYOUT.PHASE_SPACING_X);
      const phaseY = LAYOUT.PHASE_Y;

      // Update phase position
      updates.push({ id: phase.id, position: { x: phaseX, y: phaseY } });

      // Get steps for this phase
      const steps = nodes.filter(n => n.type === 'step' && n.parent_id === phase.id)
        .sort((a, b) => a.order_index - b.order_index);

      let currentY = LAYOUT.STEP_START_Y;

      steps.forEach((step) => {
        const stepX = phaseX + LAYOUT.STEP_OFFSET_X;
        const stepY = currentY;

        // Update step position
        updates.push({ id: step.id, position: { x: stepX, y: stepY } });

        // Move Y down for substeps
        currentY += LAYOUT.SUBSTEP_START_OFFSET_Y;

        // Get substeps for this step
        const substeps = nodes.filter(n => n.type === 'substep' && n.parent_id === step.id)
          .sort((a, b) => a.order_index - b.order_index);

        substeps.forEach((substep) => {
          const substepX = stepX + LAYOUT.SUBSTEP_OFFSET_X;
          const substepY = currentY;

          // Update substep position
          updates.push({ id: substep.id, position: { x: substepX, y: substepY } });

          currentY += LAYOUT.SUBSTEP_SPACING_Y;
        });

        // Add spacing before next step
        currentY += LAYOUT.STEP_SPACING_Y;
      });
    });

    // Batch update all node positions
    const updatePromises = updates.map(({ id, position }) =>
      supabaseAdmin!
        .from('nodes')
        .update({ position })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Some updates failed:', errors);
      return NextResponse.json(
        { error: 'Some positions failed to update' },
        { status: 500 }
      );
    }

    // Fetch updated nodes
    const { data: updatedNodes, error: refetchError } = await supabaseAdmin!
      .from('nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (refetchError) {
      console.error('Refetch error:', refetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated nodes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nodes: updatedNodes,
      updatedCount: updates.length,
    });
  } catch (error: any) {
    console.error('Error auto-formatting nodes:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

