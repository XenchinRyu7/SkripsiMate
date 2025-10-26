// Project Members API - Get & Invite
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// GET /api/projects/[id]/members - Get all members of a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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

    // Check if user has access to this project
    const { data: access } = await supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    // Also check if user is owner
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('user_id, created_at')
      .eq('id', projectId)
      .single();

    if (!access && project?.user_id !== userId) {
      return NextResponse.json(
        { error: 'No access to this project' },
        { status: 403 }
      );
    }

    // Get all members
    const { data: members, error } = await supabaseAdmin
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('invited_at', { ascending: true });

    if (error) throw error;

    // Get owner info
    const ownerMember = {
      id: project?.user_id,
      project_id: projectId,
      user_id: project?.user_id,
      email: 'owner@project.com', // TODO: Get from Firebase Auth
      role: 'owner' as const,
      status: 'active' as const,
      created_at: project?.created_at || new Date().toISOString(),
    };

    return NextResponse.json({
      members: [ownerMember, ...(members || [])],
    });

  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Invite a member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const userId = request.headers.get('x-user-id');
    const { email, role } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be editor or viewer' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if user is owner or has admin rights
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    const { data: memberAccess } = await supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const isOwner = project?.user_id === userId;
    const isAdmin = memberAccess?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only owner can invite members' },
        { status: 403 }
      );
    }

    // Check if member already exists
    const { data: existing } = await supabaseAdmin
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Member already invited' },
        { status: 400 }
      );
    }

    // Create invitation
    const { data: member, error } = await supabaseAdmin
      .from('project_members')
      .insert([
        {
          project_id: projectId,
          email: email.toLowerCase(),
          role: role,
          status: 'pending',
          invited_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // TODO: Send email invitation here
    logger.info(`Invitation sent to ${email} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      member,
      message: `Invitation sent to ${email}`,
    });

  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

