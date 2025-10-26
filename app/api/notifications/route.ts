// Notifications API - Get user's pending invitations
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/notifications - Get all pending invitations for current user
export async function GET(request: NextRequest) {
  try {
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

    // TODO: Get user email from Firebase Auth
    // For now, we'll fetch by email parameter
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      // If no email provided, return empty (user should provide their email)
      return NextResponse.json({
        invitations: [],
        count: 0,
      });
    }

    // Get all pending invitations for this email
    const { data: invitations, error } = await supabaseAdmin
      .from('project_members')
      .select(`
        id,
        project_id,
        role,
        status,
        invited_at,
        invited_by,
        projects:project_id (
          id,
          title,
          jurusan,
          description,
          user_id
        )
      `)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }

    return NextResponse.json({
      invitations: invitations || [],
      count: invitations?.length || 0,
    });

  } catch (error: any) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

