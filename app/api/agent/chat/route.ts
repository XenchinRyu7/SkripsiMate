// API Route: AI Agents Chat with Actions
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateContent } from '@/lib/gemini';
import { buildRAGContext, formatRAGContext } from '@/lib/rag';
import { logger } from '@/lib/logger';
import { 
  AI_AGENT_SYSTEM_PROMPT, 
  parseAIActionResponse,
  AIActionType,
  CreateNodeParams,
  UpdateNodeParams,
  BreakDownTaskParams,
  CreateMultipleNodesParams
} from '@/lib/ai-actions';
import { v4 as uuidv4 } from 'uuid';

/**
 * Execute AI action (create nodes, update nodes, etc.)
 */
async function executeAction(
  projectId: string,
  actionType: AIActionType,
  params: any
): Promise<{ created_nodes?: any[]; updated_nodes?: any[]; analysis?: string } | null> {
  if (!supabaseAdmin) return null;

  switch (actionType) {
    case 'create_node': {
      const nodeParams = params as CreateNodeParams;
      
      // Get max order_index
      const { data: existingNodes } = await supabaseAdmin
        .from('nodes')
        .select('order_index')
        .eq('project_id', projectId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      const maxOrder = existingNodes?.[0]?.order_index || 0;

      // Calculate position (stack vertically)
      const yPos = (maxOrder + 1) * 200;

      const newNode = {
        id: uuidv4(),
        project_id: projectId,
        title: nodeParams.title,
        description: nodeParams.description || '',
        type: nodeParams.type,
        parent_id: nodeParams.parent_id || null,
        position_x: 100,
        position_y: yPos,
        status: 'pending' as const,
        priority: nodeParams.priority || 'medium',
        order_index: maxOrder + 1,
        metadata: {
          estimated_time: nodeParams.estimated_time || '1 week',
        },
      };

      const { data, error } = await supabaseAdmin
        .from('nodes')
        .insert([newNode])
        .select();

      if (error) {
        logger.error('Failed to create node:', error);
        return null;
      }

      logger.success('Created node:', newNode.title);
      return { created_nodes: data };
    }

    case 'create_multiple_nodes': {
      const multiParams = params as CreateMultipleNodesParams;
      
      // Get max order_index
      const { data: existingNodes } = await supabaseAdmin
        .from('nodes')
        .select('order_index')
        .eq('project_id', projectId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      let maxOrder = existingNodes?.[0]?.order_index || 0;
      const createdNodes = [];

      // Create phases and their children
      for (const nodeSpec of multiParams.nodes) {
        const phaseId = uuidv4();
        const yPos = (maxOrder + 1) * 200;

        // Create parent node (phase or step)
        const parentNode = {
          id: phaseId,
          project_id: projectId,
          title: nodeSpec.title,
          description: nodeSpec.description || '',
          type: nodeSpec.type,
          parent_id: null,
          position_x: 100,
          position_y: yPos,
          status: 'pending' as const,
          priority: nodeSpec.priority || 'medium',
          order_index: maxOrder + 1,
          metadata: {
            estimated_time: nodeSpec.estimated_time || '1 week',
          },
        };

        const { data: parentData, error: parentError } = await supabaseAdmin
          .from('nodes')
          .insert([parentNode])
          .select();

        if (parentError) {
          logger.error('Failed to create parent node:', parentError);
          continue;
        }

        if (parentData) {
          createdNodes.push(...parentData);
          maxOrder++;
        }

        // Create children if any
        if (nodeSpec.children && nodeSpec.children.length > 0) {
          for (let i = 0; i < nodeSpec.children.length; i++) {
            const child = nodeSpec.children[i];
            const childNode = {
              id: uuidv4(),
              project_id: projectId,
              title: child.title,
              description: child.description || '',
              type: child.type,
              parent_id: phaseId,
              position_x: 500,
              position_y: yPos + (i * 150),
              status: 'pending' as const,
              priority: child.priority || 'medium',
              order_index: maxOrder + 1,
              metadata: {
                estimated_time: child.estimated_time || '1 week',
              },
            };

            const { data: childData, error: childError } = await supabaseAdmin
              .from('nodes')
              .insert([childNode])
              .select();

            if (!childError && childData) {
              createdNodes.push(...childData);
              maxOrder++;
            }
          }
        }
      }

      logger.success('Created', createdNodes.length, 'nodes');
      return { created_nodes: createdNodes };
    }

    case 'update_node': {
      const updateParams = params as UpdateNodeParams;
      
      const { data, error } = await supabaseAdmin
        .from('nodes')
        .update(updateParams.updates)
        .eq('id', updateParams.node_id)
        .eq('project_id', projectId)
        .select();

      if (error) {
        logger.error('Failed to update node:', error);
        return null;
      }

      logger.success('Updated node:', updateParams.node_id);
      return { updated_nodes: data };
    }

    case 'break_down_task': {
      const breakDownParams = params as BreakDownTaskParams;
      
      // Get parent node
      const { data: parentNode } = await supabaseAdmin
        .from('nodes')
        .select('*')
        .eq('id', breakDownParams.node_id)
        .single();

      if (!parentNode) {
        logger.error('Parent node not found');
        return null;
      }

      // Generate substeps using AI
      const prompt = `Break down this task into ${breakDownParams.num_substeps || 3} concrete, actionable substeps:

**Task:** ${parentNode.title}
**Description:** ${parentNode.description}

Return ONLY a JSON array of substeps:
[
  { "title": "Substep 1", "description": "What to do", "estimated_time": "2 days" },
  { "title": "Substep 2", "description": "What to do", "estimated_time": "3 days" }
]`;

      const aiResponse = await generateContent(prompt);
      const substepsMatch = aiResponse.match(/\[[\s\S]*\]/);
      
      if (!substepsMatch) {
        logger.error('Failed to parse substeps from AI');
        return null;
      }

      const substeps = JSON.parse(substepsMatch[0]);

      // Create substeps
      const createdSubsteps = [];
      for (let i = 0; i < substeps.length; i++) {
        const substep = substeps[i];
        const newSubstep = {
          id: uuidv4(),
          project_id: projectId,
          title: substep.title,
          description: substep.description || '',
          type: 'substep' as const,
          parent_id: parentNode.id,
          position_x: parentNode.position_x + 300,
          position_y: parentNode.position_y + (i * 150),
          status: 'pending' as const,
          priority: 'medium' as const,
          order_index: i,
          metadata: {
            estimated_time: substep.estimated_time || '1 day',
          },
        };

        const { data, error } = await supabaseAdmin
          .from('nodes')
          .insert([newSubstep])
          .select();

        if (!error && data) {
          createdSubsteps.push(...data);
        }
      }

      logger.success('Created', createdSubsteps.length, 'substeps');
      return { created_nodes: createdSubsteps };
    }

    default:
      logger.warn('Unknown action type:', actionType);
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, message, context, mode = 'ask' } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    logger.info(`🤖 ${mode === 'agents' ? 'Agents' : 'Ask'} Mode:`, message.substring(0, 50) + '...');

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
    // RAG: Retrieve relevant context
    // ========================================
    
    const ragContext = await buildRAGContext(message, projectId);
    const contextStr = formatRAGContext(ragContext);

    // Build prompt based on mode
    const prompt = mode === 'agents' 
      ? `${AI_AGENT_SYSTEM_PROMPT}

MODE: AGENTS MODE (You CAN execute actions!)

Project Context:
${contextStr}

User Message: ${message}

Instructions: 
- If user wants you to CREATE, ADD, UPDATE nodes → use appropriate action
- If user asks QUESTIONS or wants ADVICE → use chat_only
- Always respond in valid JSON format
- Be concise and helpful
- DO NOT use markdown formatting in your message`
      : `You're a helpful AI thesis planning advisor. Answer questions, give advice, analyze progress.

Important: You are in ASK MODE - do NOT create, update, or modify nodes. Only provide advice!

Project Context:
${contextStr}

User Question: ${message}

Task: Give concise, helpful advice (2-4 sentences). Be encouraging and insightful. Use plain text, no markdown formatting.`;

    logger.info('🤖 AI processing message...');

    // Generate response with auto-retry + fallback
    const aiRawResponse = await generateContent(prompt);
    
    logger.debug('🤖', 'AI raw response:', aiRawResponse);

    // Parse AI response (only for agents mode)
    let actionResponse = null;
    let executionResult = null;
    
    if (mode === 'agents') {
      actionResponse = parseAIActionResponse(aiRawResponse);
      
      if (!actionResponse) {
        // Fallback: treat as chat-only
        return NextResponse.json({
          success: true,
          action: { type: 'chat_only', params: {} },
          message: aiRawResponse,
          timestamp: new Date().toISOString(),
        });
      }

      // Execute action if needed
      if (actionResponse.action.type !== 'chat_only') {
        logger.info('⚡ Executing action:', actionResponse.action.type);
        executionResult = await executeAction(
          projectId,
          actionResponse.action.type,
          actionResponse.action.params
        );
      }
    }

    return NextResponse.json({
      success: true,
      action: actionResponse?.action || { type: 'chat_only', params: {} },
      message: actionResponse?.message || aiRawResponse,
      created_nodes: executionResult?.created_nodes,
      updated_nodes: executionResult?.updated_nodes,
      analysis: executionResult?.analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error in AI chat:', error);
    
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
