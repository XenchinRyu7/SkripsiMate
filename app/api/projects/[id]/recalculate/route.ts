// API Route: Recalculate Project Progress (for existing projects)
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function POST(
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

    // Get all nodes for this project
    logger.debug('🔍', 'Fetching nodes for project:', projectId);
    const { data: allNodes, error: nodesError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('project_id', projectId);

    logger.debug('📦', 'Fetched nodes count:', allNodes?.length);
    logger.debug('📊', 'Node types:', {
      phases: allNodes?.filter(n => n.type === 'phase').length,
      steps: allNodes?.filter(n => n.type === 'step').length,
      substeps: allNodes?.filter(n => n.type === 'substep').length,
    });

    if (nodesError) {
      logger.error('❌ Error fetching nodes:', nodesError);
      throw nodesError;
    }

    if (!allNodes || allNodes.length === 0) {
      logger.warn('⚠️ No nodes found for project');
      return NextResponse.json(
        { error: 'No nodes found for this project' },
        { status: 404 }
      );
    }

    // 1. Recalculate phase progress
    const phases = allNodes.filter(n => n.type === 'phase');
    for (const phase of phases) {
      const phaseSteps = allNodes.filter(n => n.parent_id === phase.id && n.type === 'step');
      
      if (phaseSteps.length > 0) {
        const completedSteps = phaseSteps.filter(s => s.status === 'completed').length;
        const progress = Math.round((completedSteps / phaseSteps.length) * 100);
        
        const currentMetadata = (phase.metadata as any) || {};
        
        await supabaseAdmin
          .from('nodes')
          .update({
            metadata: {
              ...currentMetadata,
              progress,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', phase.id);
      }
    }

    // 2. Recalculate project-level progress
    const totalNodes = allNodes.length; // Count ALL nodes including phases
    const completedNodes = allNodes.filter(n => n.status === 'completed').length;
    
    logger.debug('📊', 'Calculating progress:');
    logger.info('  - Total nodes (ALL types):', totalNodes);
    logger.info('  - Completed nodes:', completedNodes);
    
    const progressPercentage = totalNodes > 0 
      ? Math.round((completedNodes / totalNodes) * 100)
      : 0;
    
    logger.info('  - Progress percentage:', progressPercentage + '%');

    // Find current phase
    const sortedPhases = phases.sort((a, b) => {
      const aIndex = (a.metadata as any)?.phaseIndex || 0;
      const bIndex = (b.metadata as any)?.phaseIndex || 0;
      return aIndex - bIndex;
    });

    const currentPhase = sortedPhases.find(p => p.status === 'in_progress') 
      || sortedPhases.find(p => p.status === 'pending')
      || sortedPhases[sortedPhases.length - 1];

    // Get existing metadata
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('metadata')
      .eq('id', projectId)
      .single();

    const existingMetadata = (project?.metadata as any) || {};

    // Update project metadata
    await supabaseAdmin
      .from('projects')
      .update({
        metadata: {
          ...existingMetadata,
          currentPhase: currentPhase?.title || 'N/A',
          totalSteps: totalNodes,
          completedSteps: completedNodes,
          progressPercentage,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    // Fetch updated project
    const { data: updatedProject } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Fetch updated nodes
    const { data: updatedNodes } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      nodes: updatedNodes,
      summary: {
        totalNodes: totalNodes,
        completedNodes: completedNodes,
        completedWork: completedNodes,
        totalWork: totalNodes,
        progressPercentage,
        phases: phases.length,
      },
      message: 'Project progress recalculated successfully',
    });
  } catch (error: any) {
    logger.error('Error recalculating progress:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

