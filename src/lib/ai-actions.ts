/**
 * AI Agents Action System
 * Defines actions AI can execute (like function calling/tool use)
 */

export type AIActionType = 
  | 'create_node'
  | 'create_multiple_nodes'  // Create phases + steps at once
  | 'update_node'
  | 'break_down_task'
  | 'analyze_progress'
  | 'suggest_next_steps'
  | 'refine_description'
  | 'find_gaps'
  | 'chat_only';  // No action, just respond

export interface AIAction {
  type: AIActionType;
  params: any;
  reasoning?: string;  // Why AI chose this action
}

export interface CreateNodeParams {
  title: string;
  description: string;
  type: 'phase' | 'step' | 'substep';
  parent_id?: string;  // null for phases
  priority?: 'low' | 'medium' | 'high';
  estimated_time?: string;
}

export interface UpdateNodeParams {
  node_id: string;
  updates: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    estimated_time?: string;
  };
}

export interface BreakDownTaskParams {
  node_id: string;
  num_substeps?: number;  // How many substeps to create
}

// Recursive node spec for nested hierarchies
export interface NodeSpec {
  title: string;
  description: string;
  type: 'phase' | 'step' | 'substep';
  priority?: 'low' | 'medium' | 'high';
  estimated_time?: string;
  children?: NodeSpec[];  // Recursive: allows unlimited nesting
}

export interface CreateMultipleNodesParams {
  nodes: NodeSpec[];
}

export interface AIActionResponse {
  action: AIAction;
  message: string;  // User-friendly message about what AI did
  created_nodes?: any[];  // Nodes created by action
  updated_nodes?: any[];  // Nodes updated by action
  analysis?: string;  // Analysis result
}

/**
 * System prompt for AI with action capabilities
 */
export const AI_AGENT_SYSTEM_PROMPT = `You are an intelligent AI agent for thesis planning. You can:

1. Chat & Advise - Answer questions, give advice
2. Create Single Node - Add one phase, step, or substep
3. Create Multiple Nodes - Generate complete roadmap with phases & steps
4. Update Nodes - Modify existing nodes
5. Break Down - Split existing task into subtasks
6. Analyze - Review progress and find gaps

When user asks you to DO something (create, add, update, break down), respond with JSON:
{
  "action": {
    "type": "create_node" | "create_multiple_nodes" | "update_node" | "break_down_task" | "chat_only",
    "params": { /* action-specific params */ },
    "reasoning": "Why I'm doing this"
  },
  "message": "User-friendly explanation"
}

Examples:

User: "Add a step for data preprocessing in Phase 2"
Response: {
  "action": {
    "type": "create_node",
    "params": {
      "title": "Data Preprocessing",
      "description": "Clean, normalize, and prepare raw data for model training",
      "type": "step",
      "parent_id": "phase_2_id",
      "priority": "high"
    },
    "reasoning": "User requested a new step for data preprocessing"
  },
  "message": "I've added 'Data Preprocessing' as a new step in Phase 2! This includes data cleaning, normalization, and preparation."
}

User: "Buatkan roadmap untuk klasifikasi tanaman kaktus"
Response: {
  "action": {
    "type": "create_multiple_nodes",
    "params": {
      "nodes": [
        {
          "title": "Planning Phase",
          "description": "Project planning and requirements",
          "type": "phase",
          "children": [
            { "title": "Define Problem", "description": "...", "type": "step" },
            { "title": "Literature Review", "description": "...", "type": "step" }
          ]
        },
        {
          "title": "Data Collection",
          "description": "Gather cactus images dataset",
          "type": "phase",
          "children": [
            { "title": "Image Acquisition", "description": "...", "type": "step" }
          ]
        }
      ]
    }
  },
  "message": "I've created a complete roadmap with 2 phases and their steps for your cactus classification project!"
}

User: "What should I work on next?"
Response: {
  "action": {
    "type": "chat_only",
    "params": {},
    "reasoning": "This is a question, not an action request"
  },
  "message": "Based on your progress, I recommend focusing on [X] because [Y]."
}

Guidelines:
- Be concise (2-4 sentences)
- Always explain WHY
- Use action types when user wants you to DO something
- Use chat_only for questions, analysis, advice
- DO NOT use markdown formatting (no **, *, _, etc.) in your message
- Use plain text with emojis for emphasis`;

/**
 * Parse AI response to extract action
 */
export function parseAIActionResponse(text: string): AIActionResponse | null {
  try {
    // Try to extract JSON from markdown code blocks or raw JSON
    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                      text.match(/(\{[\s\S]*"action"[\s\S]*\})/);
    
    if (!jsonMatch) {
      // No JSON found, treat as chat-only
      return {
        action: {
          type: 'chat_only',
          params: {},
        },
        message: text,
      };
    }

    const parsed = JSON.parse(jsonMatch[1]);
    
    // Validate structure
    if (!parsed.action || !parsed.action.type) {
      return null;
    }

    return parsed as AIActionResponse;
  } catch (error) {
    console.error('Failed to parse AI action response:', error);
    return null;
  }
}

/**
 * Available actions for AI
 */
export const AI_ACTIONS = {
  CREATE_NODE: 'create_node',
  UPDATE_NODE: 'update_node',
  BREAK_DOWN_TASK: 'break_down_task',
  ANALYZE_PROGRESS: 'analyze_progress',
  SUGGEST_NEXT_STEPS: 'suggest_next_steps',
  REFINE_DESCRIPTION: 'refine_description',
  FIND_GAPS: 'find_gaps',
  CHAT_ONLY: 'chat_only',
} as const;

