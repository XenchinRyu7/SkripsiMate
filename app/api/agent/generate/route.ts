// API Route: Generate Thesis Roadmap
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Removed edge runtime - needs access to SUPABASE_SERVICE_ROLE_KEY

interface GenerateRequest {
  projectId: string;
  title: string;
  jurusan: string;
  timeline: string;
  description?: string;
  additionalContext?: string;
  generateMode?: 'fresh' | 'merge';
}

interface PhaseStructure {
  title: string;
  description: string;
  estimatedTime: string;
  steps: StepStructure[];
}

interface StepStructure {
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  substeps?: string[];
}

// System prompt for planning
const PLANNER_PROMPT = `You are an expert thesis advisor specializing in creating comprehensive academic roadmaps for Indonesian university students. 

Your task is to create a detailed, actionable thesis roadmap with realistic timelines and clear dependencies.

Consider:
- Indonesian academic standards and thesis structure
- Student's field of study (jurusan)
- Timeline constraints
- Practical, actionable steps
- Clear milestones and checkpoints

Structure your response as JSON with this format:
{
  "phases": [
    {
      "title": "Phase name",
      "description": "What this phase entails",
      "estimatedTime": "2-3 weeks",
      "steps": [
        {
          "title": "Specific task",
          "description": "Detailed description",
          "estimatedTime": "3 days",
          "priority": "high",
          "substeps": ["Substep 1", "Substep 2"]
        }
      ]
    }
  ]
}

Create 5-8 phases covering: Preparation, Literature Review, Methodology, Implementation/Research, Analysis, Writing, and Finalization.`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { projectId, title, jurusan, timeline, description, additionalContext, generateMode = 'fresh' } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // If mode is 'merge', delete existing nodes first
    if (generateMode === 'merge') {
      logger.info('Deleting existing nodes for project:', projectId);
      const { error: deleteError } = await supabaseAdmin
        .from('nodes')
        .delete()
        .eq('project_id', projectId);
      
      if (deleteError) {
        console.error('Error deleting existing nodes:', deleteError);
        // Continue anyway, don't fail the whole operation
      }
    }

    // Build user prompt
    const userPrompt = `
Create a comprehensive thesis roadmap for:

Title: ${title}
Jurusan: ${jurusan}
Timeline: ${timeline}
${description ? `Description: ${description}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a detailed structure with:
- 5-8 major phases (Persiapan, BAB 1-5, Implementation, Writing, Finalization)
- 3-5 steps per phase
- Actionable substeps with clear deliverables
- Realistic time estimates
- Priority levels
- Clear progression and dependencies

Return ONLY valid JSON matching the specified format.
`;

    // Call Gemini AI
    logger.info('Calling Gemini AI to generate roadmap...');
    const fullPrompt = `${PLANNER_PROMPT}\n\n${userPrompt}`;
    const aiResponse = await generateJSON<{ phases: PhaseStructure[] }>(fullPrompt);

    // Convert AI response to database nodes with proper hierarchical layout
    const nodes: any[] = [];
    let orderIndex = 0;

    // Layout configuration - All vertical tree structure
    const LAYOUT = {
      PHASE_SPACING_X: 1200,     // Horizontal space between phases (extra wide to prevent overlap)
      PHASE_START_X: 100,        // Starting X position for first phase
      PHASE_Y: 100,              // Y position for all phases (horizontal line)
      
      STEP_START_Y: 400,         // Y position for first step under phase
      STEP_SPACING_Y: 100,       // Vertical space between steps (increased)
      STEP_OFFSET_X: 0,          // X offset from phase (same column)
      
      SUBSTEP_START_OFFSET_Y: 150,  // Distance from step to first substep
      SUBSTEP_SPACING_Y: 100,       // Vertical space between substeps
      SUBSTEP_OFFSET_X: 50,         // Slight indent to show hierarchy
    };

    // Create nodes for each phase with hierarchical layout
    for (let phaseIndex = 0; phaseIndex < aiResponse.phases.length; phaseIndex++) {
      const phase = aiResponse.phases[phaseIndex];
      const phaseId = uuidv4();

      // Calculate phase position (horizontal line from left to right)
      const phaseX = LAYOUT.PHASE_START_X + (phaseIndex * LAYOUT.PHASE_SPACING_X);
      const phaseY = LAYOUT.PHASE_Y;

      // Create phase node
      nodes.push({
        id: phaseId,
        project_id: projectId,
        title: phase.title,
        description: phase.description,
        type: 'phase',
        level: 1,
        parent_id: null,
        order_index: orderIndex++,
        status: 'pending',
        priority: 'medium',
        position: { x: phaseX, y: phaseY },
        metadata: {
          estimatedTime: phase.estimatedTime,
          progress: 0,
          phaseIndex: phaseIndex,
        },
      });

      // Create step nodes for this phase (all vertically in same column below phase)
      let currentY = LAYOUT.STEP_START_Y;
      
      for (let stepIndex = 0; stepIndex < phase.steps.length; stepIndex++) {
        const step = phase.steps[stepIndex];
        const stepId = uuidv4();

        // Calculate step position (directly below the phase, same X)
        const stepX = phaseX + LAYOUT.STEP_OFFSET_X;
        const stepY = currentY;

        nodes.push({
          id: stepId,
          project_id: projectId,
          title: step.title,
          description: step.description,
          type: 'step',
          level: 2,
          parent_id: phaseId,
          order_index: orderIndex++,
          status: 'pending',
          priority: step.priority,
          position: { x: stepX, y: stepY },
          metadata: {
            estimatedTime: step.estimatedTime,
            substeps: step.substeps || [],
            dependencies: [],
          },
        });

        // Move Y down for substeps
        currentY += LAYOUT.SUBSTEP_START_OFFSET_Y;

        // Create substep nodes if provided (vertically below step with slight indent)
        if (step.substeps && step.substeps.length > 0) {
          for (let substepIndex = 0; substepIndex < step.substeps.length; substepIndex++) {
            const substep = step.substeps[substepIndex];
            
            // Calculate substep position (below step with slight X indent)
            const substepX = stepX + LAYOUT.SUBSTEP_OFFSET_X;
            const substepY = currentY;

            nodes.push({
              id: uuidv4(),
              project_id: projectId,
              title: substep,
              description: '',
              type: 'substep',
              level: 3,
              parent_id: stepId,
              order_index: orderIndex++,
              status: 'pending',
              priority: step.priority,
              position: { x: substepX, y: substepY },
              metadata: {
                estimatedTime: '1 day',
              },
            });

            // Move to next substep position
            currentY += LAYOUT.SUBSTEP_SPACING_Y;
          }
        }

        // Add spacing before next step
        currentY += LAYOUT.STEP_SPACING_Y;
      }
    }

    // Add phase-to-phase connections (Phase 1 -> Phase 2 -> Phase 3)
    for (let i = 0; i < aiResponse.phases.length - 1; i++) {
      const currentPhaseNode = nodes.find(n => n.type === 'phase' && n.metadata?.phaseIndex === i);
      const nextPhaseNode = nodes.find(n => n.type === 'phase' && n.metadata?.phaseIndex === i + 1);
      
      if (currentPhaseNode && nextPhaseNode) {
        // Store phase progression in metadata for edge creation
        if (!currentPhaseNode.metadata.nextPhase) {
          currentPhaseNode.metadata.nextPhase = nextPhaseNode.id;
        }
      }
    }

    // Insert nodes into Supabase
    logger.info(`Inserting ${nodes.length} nodes into database...`);
    const { data, error } = await supabaseAdmin
      .from('nodes')
      .insert(nodes)
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save nodes: ${error.message}`);
    }

    // Update project metadata
    await supabaseAdmin
      .from('projects')
      .update({
        metadata: {
          currentPhase: aiResponse.phases[0]?.title || 'Phase 1',
          totalSteps: nodes.filter(n => n.type === 'step' || n.type === 'substep').length,
          completedSteps: 0,
          progressPercentage: 0,
          tags: [jurusan],
        },
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      nodes: data,
      message: `Generated ${aiResponse.phases.length} phases with ${nodes.length} total nodes`,
    });
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate roadmap',
      },
      { status: 500 }
    );
  }
}

