// API Route: Cleanup Orphaned/Ghost Nodes
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { nodeIds } = body; // Optional: specific node IDs to delete

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    console.log('🧹 Starting cleanup for project:', projectId);
    console.log('🎯 Target node IDs:', nodeIds || 'ALL orphaned nodes');

    // Get all nodes for this project BEFORE cleanup
    const { data: beforeNodes } = await supabaseAdmin
      .from('nodes')
      .select('id, title, type')
      .eq('project_id', projectId);

    console.log('📦 Nodes BEFORE cleanup:', beforeNodes?.length);

    let deletedCount = 0;

    if (nodeIds && Array.isArray(nodeIds) && nodeIds.length > 0) {
      // Delete specific nodes
      console.log('🗑️ Deleting specific nodes:', nodeIds);
      
      const { data: deletedNodes, error: deleteError } = await supabaseAdmin
        .from('nodes')
        .delete()
        .eq('project_id', projectId)
        .in('id', nodeIds)
        .select();

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      deletedCount = deletedNodes?.length || 0;
      console.log('✅ Deleted nodes:', deletedCount);
    } else {
      // Find and delete orphaned nodes (nodes with missing parents)
      console.log('🔍 Finding orphaned nodes...');
      
      const { data: allNodes } = await supabaseAdmin
        .from('nodes')
        .select('*')
        .eq('project_id', projectId);

      if (!allNodes) {
        return NextResponse.json({ 
          success: true,
          message: 'No nodes found',
          deletedCount: 0 
        });
      }

      const nodeMap = new Map(allNodes.map(n => [n.id, n]));
      const orphanedNodes: string[] = [];

      // Find nodes with parent_id that doesn't exist
      for (const node of allNodes) {
        if (node.parent_id && !nodeMap.has(node.parent_id)) {
          orphanedNodes.push(node.id);
          console.log('🚫 Orphaned node found:', node.title, '(parent missing)');
        }
      }

      if (orphanedNodes.length > 0) {
        const { data: deletedNodes, error: deleteError } = await supabaseAdmin
          .from('nodes')
          .delete()
          .in('id', orphanedNodes)
          .select();

        if (deleteError) {
          console.error('❌ Failed to delete orphaned nodes:', deleteError);
          throw deleteError;
        }

        deletedCount = deletedNodes?.length || 0;
        console.log('✅ Deleted orphaned nodes:', deletedCount);
      }
    }

    // Get all nodes AFTER cleanup
    const { data: afterNodes } = await supabaseAdmin
      .from('nodes')
      .select('id, title, type, status')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    console.log('📦 Nodes AFTER cleanup:', afterNodes?.length);

    // Recalculate progress (count ALL nodes including phases)
    const totalWork = afterNodes?.length || 0;
    const completedWork = afterNodes?.filter(n => n.status === 'completed').length || 0;
    const progressPercentage = totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0;

    // Update project metadata
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('metadata')
      .eq('id', projectId)
      .single();

    const existingMetadata = (project?.metadata as any) || {};

    await supabaseAdmin
      .from('projects')
      .update({
        metadata: {
          ...existingMetadata,
          totalSteps: totalWork,
          completedSteps: completedWork,
          progressPercentage,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    console.log('✅ Cleanup complete!');
    console.log('📊 Summary:', {
      before: beforeNodes?.length,
      after: afterNodes?.length,
      deleted: deletedCount,
      progress: `${progressPercentage}%`,
    });

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      summary: {
        nodesBefore: beforeNodes?.length || 0,
        nodesAfter: afterNodes?.length || 0,
        deletedCount,
        totalWork,
        completedWork,
        progressPercentage,
      },
      nodes: afterNodes,
    });
  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

