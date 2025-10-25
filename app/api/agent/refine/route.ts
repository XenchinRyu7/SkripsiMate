// API Route: Refine Node
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

interface RefineRequest {
  nodeId: string;
  projectId: string;
}

const REFINER_PROMPT = `You are a detail-oriented academic advisor who improves thesis step descriptions.

Given a step, enhance it by:
1. Making description more specific and actionable
2. Adding concrete checkpoints (3-5 items)
3. Suggesting relevant resources (papers, tools, tutorials)
4. Refining time estimate if needed
5. Adding practical tips

Return JSON format:
{
  "description": "Enhanced description",
  "checkpoints": ["Checkpoint 1", "Checkpoint 2", ...],
  "resources": [
    {
      "type": "paper|tutorial|tool",
      "title": "Resource name",
      "description": "Why it's useful"
    }
  ],
  "estimatedTime": "refined estimate",
  "tips": ["Tip 1", "Tip 2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const body: RefineRequest = await request.json();
    const { nodeId, projectId } = body;

    // Fetch node and project details
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
Project Context:
- Title: ${project?.title}
- Jurusan: ${project?.jurusan}

Current Step:
- Title: ${node.title}
- Description: ${node.description || 'No description'}
- Type: ${node.type}
- Priority: ${node.priority}

Enhance this step with detailed, actionable improvements.`;

    const fullPrompt = `${REFINER_PROMPT}\n\n${userPrompt}`;

    // Generate refinements
    const aiResponse = await generateJSON(fullPrompt);

    // Update node with refinements
    const updatedMetadata = {
      ...(node.metadata || {}),
      checkpoints: aiResponse.checkpoints,
      resources: aiResponse.resources,
      tips: aiResponse.tips,
      estimatedTime: aiResponse.estimatedTime,
      refined: true,
      refinedAt: new Date().toISOString(),
    };

    const { data: updatedNode, error: updateError } = await supabase
      .from('nodes')
      .update({
        description: aiResponse.description,
        metadata: updatedMetadata,
      })
      .eq('id', nodeId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      node: updatedNode,
      improvements: aiResponse,
    });
  } catch (error: any) {
    console.error('Error refining node:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refine node',
      },
      { status: 500 }
    );
  }
}

