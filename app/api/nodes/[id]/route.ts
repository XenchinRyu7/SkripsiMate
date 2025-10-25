// API Route: Delete Node
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nodeId } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    console.log('DELETE node request:', { nodeId, projectId });

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

    // Get the node to check if it exists
    const { data: node, error: nodeError } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .eq('project_id', projectId)
      .single();

    if (nodeError || !node) {
      console.error('Node not found:', nodeError);
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    // Delete the node (CASCADE will handle child nodes)
    const { error: deleteError } = await supabaseAdmin
      .from('nodes')
      .delete()
      .eq('id', nodeId);

    if (deleteError) {
      console.error('Error deleting node:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete node' },
        { status: 500 }
      );
    }

    console.log('Node deleted successfully:', nodeId);

    return NextResponse.json({
      success: true,
      message: 'Node deleted successfully',
      deletedNodeId: nodeId,
    });
  } catch (error: any) {
    console.error('Error deleting node:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

