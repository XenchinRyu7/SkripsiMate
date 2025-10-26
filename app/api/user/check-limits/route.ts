// Check if user can create project based on subscription limits
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check deployment mode
function isSelfHosted(request: NextRequest): boolean {
  // Check env variable first
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud') {
    return false;
  }
  
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'self-hosted') {
    return true;
  }

  // Check by domain
  const host = request.headers.get('host') || '';
  const cloudDomains = [
    'skripsimate.vercel.app',
    'console.skripsimate.wrnd.me',
  ];
  
  const isCloud = cloudDomains.some(domain => host.includes(domain));
  return !isCloud; // Default to self-hosted
}

export async function GET(request: NextRequest) {
  try {
    // Check if self-hosted (unlimited access)
    const selfHosted = isSelfHosted(request);
    
    if (selfHosted) {
      // Self-hosted: Always allow unlimited
      return NextResponse.json({
        can_create: true,
        current_projects: 0,
        max_projects: 999999,
        max_nodes: 999999,
        max_members: 999999,
        plan: 'self-hosted',
        status: 'active',
        is_active: true,
        is_self_hosted: true,
        reason: null,
      });
    }

    // Cloud-hosted: Check subscription
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

    // Get user subscription
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get current project count
    const { count: projectCount } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const currentProjects = projectCount || 0;

    // Cloud-hosted without subscription = NO ACCESS
    if (!subscription) {
      return NextResponse.json({
        can_create: false,
        current_projects: currentProjects,
        max_projects: 0,
        max_nodes: 0,
        max_members: 0,
        plan: 'none',
        status: 'inactive',
        is_active: false,
        is_self_hosted: false,
        reason: 'No subscription plan. Please redeem a coupon code or upgrade.',
      });
    }

    // Check if subscription is active
    const isActive = subscription.status === 'active' && 
                     new Date(subscription.current_period_end) > new Date();

    // Check if can create project
    const canCreate = isActive && currentProjects < subscription.max_projects;

    return NextResponse.json({
      can_create: canCreate,
      current_projects: currentProjects,
      max_projects: subscription.max_projects,
      max_nodes: subscription.max_nodes_per_project,
      max_members: subscription.max_team_members,
      plan: subscription.plan,
      status: subscription.status,
      is_active: isActive,
      is_self_hosted: false,
      reason: !canCreate 
        ? (!isActive 
          ? 'Subscription expired or inactive' 
          : `Project limit reached (${currentProjects}/${subscription.max_projects})`)
        : null
    });

  } catch (error: any) {
    console.error('Error checking limits:', error);
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    );
  }
}

