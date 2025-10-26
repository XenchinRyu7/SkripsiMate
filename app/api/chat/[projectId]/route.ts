// Chat History API
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// GET /api/chat/[projectId] - Get chat history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch chat history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
    });
  } catch (error: any) {
    logger.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/[projectId] - Save chat message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const {
      userId,
      role,
      content,
      mode,
      action_type,
      created_nodes,
      updated_nodes,
    } = await request.json();

    logger.debug('📥 Received chat message save request:', {
      projectId,
      userId,
      role,
      mode,
      action_type,
      created_nodes,
      updated_nodes,
      contentLength: content?.length || 0,
    });

    if (!projectId || !userId || !role || !content || !mode) {
      logger.error('❌ Missing required fields!', { projectId, userId, role, mode });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const insertData = {
      project_id: projectId,
      user_id: userId,
      role,
      content,
      mode,
      action_type: action_type || null,
      created_nodes: created_nodes || 0,
      updated_nodes: updated_nodes || 0,
    };

    logger.debug('💾 Attempting to insert chat message:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert([insertData])
      .select();

    if (error) {
      logger.error('❌ FAILED to save chat message!');
      logger.error('Error code:', error.code);
      logger.error('Error message:', error.message);
      logger.error('Error details:', error.details);
      logger.error('Error hint:', error.hint);
      logger.error('Insert data attempted:', JSON.stringify(insertData, null, 2));
      return NextResponse.json(
        { error: 'Failed to save message', details: error },
        { status: 500 }
      );
    }

    logger.debug('✅ Chat message saved successfully!', data?.[0]?.id);

    return NextResponse.json({
      success: true,
      message: data?.[0],
    });
  } catch (error: any) {
    logger.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/[projectId] - Clear chat history
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to clear chat history:', error);
      return NextResponse.json(
        { error: 'Failed to clear history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error: any) {
    logger.error('Error clearing chat history:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

