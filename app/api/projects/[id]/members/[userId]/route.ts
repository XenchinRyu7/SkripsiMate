// Remove Project Member API
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE /api/projects/[id]/members/[userId] - Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: projectId, userId: memberUserId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if current user is owner
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    const isOwner = project?.user_id === currentUserId;
    const isSelf = memberUserId === currentUserId;

    // Only owner can remove others, anyone can remove themselves
    if (!isOwner && !isSelf) {
      return NextResponse.json(
        { error: 'Only owner can remove members' },
        { status: 403 }
      );
    }

    // Cannot remove owner
    if (memberUserId === project?.user_id) {
      return NextResponse.json(
        { error: 'Cannot remove project owner' },
        { status: 400 }
      );
    }

    // Delete member
    const { error } = await supabaseAdmin
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', memberUserId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });

  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

