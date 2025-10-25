// API Route: Update Node Position
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nodeId } = await params;
    const { position } = await request.json();

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return NextResponse.json(
        { error: 'Invalid position data' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Update node position in database
    const { data, error } = await supabaseAdmin
      .from('nodes')
      .update({ position })
      .eq('id', nodeId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update position' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, node: data });
  } catch (error: any) {
    console.error('Error updating node position:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

