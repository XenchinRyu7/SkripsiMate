// Accept/Decline Invitation API
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/notifications/[id] - Accept or decline invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;
    const userId = request.headers.get('x-user-id');
    const { action } = await request.json(); // 'accept' or 'decline'

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get invitation details
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('project_members')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      // Accept invitation - update status to active and set user_id
      const { error: updateError } = await supabaseAdmin
        .from('project_members')
        .update({
          status: 'active',
          user_id: userId,
          joined_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Get project info for response
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('id, title')
        .eq('id', invitation.project_id)
        .single();

      return NextResponse.json({
        success: true,
        message: 'Invitation accepted!',
        project: project,
      });

    } else {
      // Decline invitation - delete the invitation
      const { error: deleteError } = await supabaseAdmin
        .from('project_members')
        .delete()
        .eq('id', invitationId);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: 'Invitation declined',
      });
    }

  } catch (error: any) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete/dismiss notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
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

    // Delete the invitation
    const { error } = await supabaseAdmin
      .from('project_members')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Notification dismissed',
    });

  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

