// User Subscription API - Get current subscription info
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Firebase token (you'd implement proper auth here)
    const userId = request.headers.get('x-user-id'); // Placeholder
    
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

    // Check if user has subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get project count
    const { count: projectsCount } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get total nodes count
    const { count: nodesCount } = await supabaseAdmin
      .from('nodes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // If no subscription, return free plan
    if (subError || !subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        projects_count: projectsCount || 0,
        nodes_count: nodesCount || 0,
        max_projects: 999999,
        max_nodes: 999999,
        max_team_members: 1,
      });
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      projects_count: projectsCount || 0,
      nodes_count: nodesCount || 0,
      max_projects: subscription.max_projects,
      max_nodes: subscription.max_nodes_per_project,
      max_team_members: subscription.max_team_members,
      current_period_end: subscription.current_period_end,
    });

  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

