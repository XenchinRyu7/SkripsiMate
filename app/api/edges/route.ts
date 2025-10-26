// API Route: Create Edge
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { projectId, source, target, sourceHandle, targetHandle, type, animated, style, label, labelStyle, labelBgStyle } = await request.json();

    if (!projectId || !source || !target) {
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

    // Get source and target nodes to detect if this is parent-child relationship
    const { data: sourceNode } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('id', source)
      .single();

    const { data: targetNode } = await supabaseAdmin
      .from('nodes')
      .select('*')
      .eq('id', target)
      .single();

    console.log('Creating edge:', { source, target, sourceNode: sourceNode?.type, targetNode: targetNode?.type });

    // Check if this is a valid parent-child relationship
    const isParentChild = (
      (sourceNode?.type === 'phase' && targetNode?.type === 'step') ||
      (sourceNode?.type === 'step' && targetNode?.type === 'substep')
    );

    if (isParentChild) {
      // Set parent_id relationship in database
      console.log('Setting parent_id relationship');
      const { error: updateError } = await supabaseAdmin
        .from('nodes')
        .update({ parent_id: source })
        .eq('id', target);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to create edge relationship' },
          { status: 500 }
        );
      }
    } else {
      // Save as custom edge in project metadata
      console.log('Saving as custom edge');
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
      const deletedEdges = metadata.deletedEdges || [];

      // Add new edge if it doesn't exist
      const edgeId = `e-${source}-${target}`;
      const existingEdge = customEdges.find((e: any) => e.id === edgeId);
      
      if (!existingEdge) {
        customEdges.push({
          id: edgeId,
          source,
          target,
          sourceHandle,
          targetHandle,
          type: type || 'smoothstep',
          animated: animated || false,
          style: style || { stroke: '#6b7280', strokeWidth: 2 },
          ...(label && { label }),
          ...(labelStyle && { labelStyle }),
          ...(labelBgStyle && { labelBgStyle }),
          createdAt: new Date().toISOString(),
        });
      }

      // Remove from deletedEdges if it was previously deleted (restore edge)
      const updatedDeletedEdges = deletedEdges.filter((id: string) => id !== edgeId);

      // Update project metadata
      const { error: updateError } = await supabaseAdmin
        .from('projects')
        .update({
          metadata: {
            ...metadata,
            customEdges,
            deletedEdges: updatedDeletedEdges,
          },
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to save edge' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      edge: { id: `e-${source}-${target}`, source, target, sourceHandle, targetHandle },
    });
  } catch (error: any) {
    console.error('Error creating edge:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

