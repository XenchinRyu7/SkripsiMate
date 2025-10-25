// API Route: Update and Delete Edge
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const edgeId = decodeURIComponent(resolvedParams.id);
    const { projectId, updates } = await request.json();
    
    console.log('PATCH edge request:', { edgeId, projectId, updates });

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

    // Get project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('metadata')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const metadata = (project.metadata as any) || {};
    const customEdges = metadata.customEdges || [];

    // Update edge style
    const updatedEdges = customEdges.map((e: any) => 
      e.id === edgeId 
        ? { ...e, ...updates, updatedAt: new Date().toISOString() }
        : e
    );

    // Update project metadata
    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        metadata: {
          ...metadata,
          customEdges: updatedEdges,
        },
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update edge' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Edge updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating edge:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const edgeId = decodeURIComponent(resolvedParams.id);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    console.log('DELETE edge request:', { edgeId, projectId });

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

    // Parse edge ID to extract UUIDs using regex
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // Edge ID format: e-[prefix-]uuid1-uuid2 or e-phase-uuid1-uuid2
    
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const uuids = edgeId.match(uuidRegex);
    
    if (!uuids || uuids.length < 2) {
      console.error('Could not parse UUIDs from edge ID:', edgeId);
      return NextResponse.json(
        { error: 'Invalid edge ID format' },
        { status: 400 }
      );
    }
    
    // First UUID is source, second is target
    const sourceId = uuids[0];
    const targetId = uuids[1];

    console.log('Parsed edge:', { edgeId, sourceId, targetId, uuidCount: uuids.length });

    // Check if this is a parent-child relationship edge
    const { data: targetNode } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('id', targetId)
      .single();

    if (targetNode && targetNode.parent_id === sourceId) {
      // This is a parent-child edge, remove the parent_id relationship
      console.log('Removing parent_id relationship for node:', targetId);
      const { error: updateNodeError } = await supabaseAdmin
        .from('nodes')
        .update({ parent_id: null })
        .eq('id', targetId);

      if (updateNodeError) {
        console.error('Error updating node:', updateNodeError);
        return NextResponse.json(
          { error: 'Failed to remove edge relationship' },
          { status: 500 }
        );
      }
    }

    // Update project metadata: remove from customEdges AND add to deletedEdges
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('metadata')
      .eq('id', projectId)
      .single();

    if (!projectError && project) {
      const metadata = (project.metadata as any) || {};
      const customEdges = metadata.customEdges || [];
      const deletedEdges = metadata.deletedEdges || [];
      
      // Remove from custom edges
      const updatedCustomEdges = customEdges.filter((e: any) => e.id !== edgeId);
      
      // Add to deleted edges (to hide auto-generated edges like phase-to-phase)
      if (!deletedEdges.includes(edgeId)) {
        deletedEdges.push(edgeId);
      }

      await supabaseAdmin
        .from('projects')
        .update({
          metadata: {
            ...metadata,
            customEdges: updatedCustomEdges,
            deletedEdges: deletedEdges,
          },
        })
        .eq('id', projectId);
    }

    return NextResponse.json({
      success: true,
      message: 'Edge deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting edge:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

