// API Route: Break Down Task
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';

interface BreakdownRequest {
  nodeId: string;
  projectId: string;
}

const BREAKDOWN_PROMPT = `You are a task breakdown expert. Break complex tasks into smaller, manageable subtasks.

Each subtask should be:
- Specific and actionable
- Completable in 1-3 days
- Have clear deliverable
- Logically sequenced

Return JSON format:
{
  "subtasks": [
    {
      "title": "Subtask name",
      "description": "What to do",
      "estimatedTime": "1 day",
      "priority": "medium",
      "deliverable": "What you'll produce"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body: BreakdownRequest = await request.json();
    const { nodeId, projectId } = body;

    // Fetch node details
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Build prompt
    const userPrompt = `
Project: ${project?.title} (${project?.jurusan})

Task to Break Down:
- Title: ${node.title}
- Description: ${node.description || 'No description'}
- Type: ${node.type}
- Estimated Time: ${(node.metadata as any)?.estimatedTime || 'Unknown'}

Create 3-5 specific subtasks that cover all aspects of this task.`;

    const fullPrompt = `${BREAKDOWN_PROMPT}\n\n${userPrompt}`;

    // Generate subtasks
    const aiResponse = await generateJSON<{ subtasks: any[] }>(fullPrompt);

    // Get node position for layout
    const parentPosition = node.position as any;
    
    // Create subtask nodes
    const subtaskNodes = aiResponse.subtasks.map((subtask, index) => ({
      id: uuidv4(),
      project_id: projectId,
      title: subtask.title,
      description: subtask.description,
      type: node.type === 'phase' ? 'step' : 'substep',
      level: node.level + 1,
      parent_id: nodeId,
      order_index: index,
      status: 'pending',
      priority: subtask.priority,
      position: {
        x: (parentPosition?.x || 0) + 50 + (index * 250),
        y: (parentPosition?.y || 0) + 150,
      },
      metadata: {
        estimatedTime: subtask.estimatedTime,
        deliverable: subtask.deliverable,
        generatedBy: 'ai',
      },
    }));

    // Insert subtask nodes
    const { data: insertedNodes, error: insertError } = await supabase
      .from('nodes')
      .insert(subtaskNodes)
      .select();

    if (insertError) throw insertError;

    // Update parent node metadata to indicate it has been broken down
    await supabase
      .from('nodes')
      .update({
        metadata: {
          ...(node.metadata || {}),
          brokenDown: true,
          brokenDownAt: new Date().toISOString(),
          childCount: subtaskNodes.length,
        },
      })
      .eq('id', nodeId);

    return NextResponse.json({
      success: true,
      subtasks: insertedNodes,
      count: insertedNodes.length,
    });
  } catch (error: any) {
    console.error('Error breaking down task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to break down task',
      },
      { status: 500 }
    );
  }
}

