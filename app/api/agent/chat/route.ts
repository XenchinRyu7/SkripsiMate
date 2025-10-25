// API Route: AI Agents Chat
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateContent } from '@/lib/gemini';
import { buildRAGContext, formatRAGContext } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { projectId, message, context } = await request.json();

    if (!projectId || !message) {
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

    // Get project data for context
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // ========================================
    // RAG: Lightweight context with vector search
    // Only retrieve RELEVANT nodes (saves 90% tokens!)
    // ========================================
    
    const ragContext = await buildRAGContext(message, projectId);
    const contextStr = formatRAGContext(ragContext);

    // Build optimized prompt (SHORT = less tokens = cheaper!)
    const prompt = `You're a helpful AI thesis planning agent. Be brief, specific, actionable.

${contextStr}

**User:** ${message}

**Task:** Give concise, helpful advice (2-3 sentences). Be encouraging.`;

    // Generate response with auto-retry + fallback
    const agentResponse = await generateContent(prompt);

    return NextResponse.json({
      success: true,
      message: agentResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    
    // User-friendly error message
    let userMessage = 'Sorry, AI is temporarily busy. Please try again in a moment.';
    
    if (error.message?.includes('overloaded') || error.message?.includes('503')) {
      userMessage = '🔄 Gemini is overloaded. Retrying with faster model...';
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      userMessage = '⏱️ Rate limit reached. Please wait a moment before trying again.';
    } else if (error.message?.includes('API key')) {
      userMessage = '🔑 API configuration issue. Please contact support.';
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        userMessage 
      },
      { status: 500 }
    );
  }
}
