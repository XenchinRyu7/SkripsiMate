// ============================================
// USER STRUCTURES (Firebase Auth)
// ============================================

export interface User {
  uid: string; // Firebase UID
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  createdAt: Date;
  lastLogin: Date;

  // Preferences
  preferences?: {
    theme: 'light' | 'dark';
    defaultJurusan?: string;
    defaultTimeline?: string;
  };

  // Stats (for dashboard)
  stats?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasksCompleted: number;
  };
}

// ============================================
// PROJECT & NODE STRUCTURES
// ============================================

export interface Project {
  id: string;
  userId: string; // Firebase UID (owner)
  title: string;
  jurusan: string;
  timeline: string; // "6 months"
  targetDate?: Date;
  description?: string;

  // Ownership & Sharing
  owner: {
    uid: string;
    email: string;
    displayName?: string;
  };
  collaborators?: string[]; // Firebase UIDs (future feature)
  visibility: 'private' | 'shared'; // For now, all private

  // Progress tracking
  metadata: {
    totalSteps: number;
    completedSteps: number;
    currentPhase: string;
    estimatedCompletion: Date;
    tags: string[];
    progressPercentage: number; // Calculated
  };

  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date; // For "Last edited" display
}

export interface Node {
  id: string;
  projectId: string;

  // Content
  title: string;
  description: string;
  type: 'phase' | 'step' | 'substep' | 'checklist';
  level: number; // 1=phase, 2=step, 3=substep, 4=checklist

  // Hierarchy
  parentId?: string;
  childIds: string[];
  order: number;

  // Status & Progress
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number; // 0-100
  completedAt?: Date;

  // Planning
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string; // "3 days", "2 weeks"
  estimatedHours?: number;
  actualTime?: string;

  // Dependencies
  dependencies: string[]; // Node IDs this depends on
  blockedBy: string[]; // Node IDs blocking this

  // AI Generated
  aiSuggestions?: string[];
  resources?: Resource[];
  checkpoints?: string[];
  codeTemplates?: CodeTemplate[];

  // Visual (React Flow)
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  style?: NodeStyle;

  // Metadata
  tags: string[];
  notes?: string;
  userNotes?: string[];

  createdAt: Date;
  updatedAt: Date;
  createdBy: 'user' | 'ai';
}

export interface Edge {
  id: string;
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'dependency' | 'sequence' | 'related';
  label?: string;
  style?: EdgeStyle;
  createdAt: Date;
}

export interface Resource {
  id: string;
  type: 'paper' | 'tutorial' | 'dataset' | 'tool' | 'documentation';
  title: string;
  url?: string;
  description?: string;
  authors?: string[];
  year?: number;
  relevance: number; // 0-1 from RAG
  reason?: string; // Why this is relevant
  tags: string[];
}

export interface CodeTemplate {
  id: string;
  language: string;
  title: string;
  description: string;
  code: string;
  usage?: string;
}

// ============================================
// AI AGENT STRUCTURES
// ============================================

export interface AgentRequest {
  id: string;
  projectId: string;
  userId: string;

  // Request details
  type: AgentActionType;
  userMessage: string;
  targetNodeIds?: string[]; // Nodes user is asking about

  // Context
  includeFullProject: boolean;
  includeConnectedNodes: boolean;
  maxContextNodes: number;

  timestamp: Date;
}

export type AgentActionType =
  | 'generate_plan' // Create new roadmap
  | 'refine_node' // Improve node content
  | 'break_down' // Split into substeps
  | 'add_missing' // Add missing steps
  | 'reorganize' // Restructure flow
  | 'analyze_progress' // Progress insights
  | 'suggest_next' // What to do next
  | 'explain' // Explain something
  | 'chat'; // General chat

export interface AgentResponse {
  id: string;
  requestId: string;

  // Reasoning (ReAct)
  reasoning: {
    observation: string; // What agent sees
    thought: string; // What agent thinks
    plan: string[]; // Steps agent will take
  };

  // Actions
  actions: AgentAction[];

  // Results
  modifications: NodeModification[];
  newNodes?: Node[];
  newEdges?: Edge[];
  deletedNodeIds?: string[];
  deletedEdgeIds?: string[];

  // Response to user
  userMessage: string;
  suggestions?: string[];
  visualChanges?: VisualChange[];

  // Metadata
  toolsUsed: string[];
  executionTime: number;
  tokensUsed: number;

  timestamp: Date;
}

export interface AgentAction {
  type: string;
  tool: string;
  input: any;
  output: any;
  success: boolean;
  error?: string;
}

export interface NodeModification {
  nodeId: string;
  field: keyof Node;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface VisualChange {
  type: 'highlight' | 'animate' | 'focus' | 'connect';
  nodeIds: string[];
  duration?: number;
  message?: string;
}

// ============================================
// RAG STRUCTURES
// ============================================

export interface NodeEmbedding {
  id: string;
  projectId: string;
  nodeId: string;

  // Content
  content: string; // Combined: title + description + notes
  contentHash: string; // To detect changes

  // Vector
  embedding: number[]; // 1536 dimensions for Gemini

  // Metadata for filtering
  metadata: {
    type: string;
    level: number;
    status: string;
    priority: string;
    tags: string[];
    createdBy: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface RAGContext {
  // Vector search results
  similarNodes: {
    node: Node;
    similarity: number;
    relevance: string;
  }[];

  // Graph traversal results
  connectedNodes: {
    node: Node;
    relationship: 'parent' | 'child' | 'dependency' | 'sibling';
    distance: number;
  }[];

  // Project context
  projectMetadata: {
    title: string;
    currentPhase: string;
    progress: number;
    completedSteps: number;
    totalSteps: number;
    timeline: string;
  };

  // User context
  userHistory?: {
    recentNodes: string[];
    commonQuestions: string[];
    preferences: Record<string, any>;
  };

  // External knowledge (if available)
  guidelines?: GuidelineChunk[];

  totalContextLength: number;
}

export interface GuidelineChunk {
  id: string;
  projectId: string;
  source: string; // PDF filename
  chunkIndex: number;
  content: string;
  embedding: number[];
  pageNumber?: number;
  section?: string;
  createdAt: Date;
}

// ============================================
// UI STRUCTURES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  agentResponseId?: string;
  visualChanges?: VisualChange[];
  attachments?: {
    type: 'node' | 'resource';
    id: string;
    preview: string;
  }[];
  timestamp: Date;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: string;
  fontSize?: number;
  fontWeight?: string;
  padding?: number;
}

export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  animated?: boolean;
}

export interface ViewState {
  zoom: number;
  center: { x: number; y: number };
  selectedNodeIds: string[];
  highlightedNodeIds: string[];
  focusedNodeId?: string;
  miniMapVisible: boolean;
  chatPanelVisible: boolean;
}

// ============================================
// INPUT/FORM STRUCTURES
// ============================================

export interface GeneratePlanInput {
  title: string;
  jurusan: string;
  timeline: string;
  context?: string;
  guidelines?: string;
}

