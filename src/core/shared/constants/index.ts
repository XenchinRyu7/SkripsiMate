// ============================================
// APPLICATION CONSTANTS
// ============================================

export const APP_NAME = 'SkripsiMate';
export const APP_DESCRIPTION = 'AI-Powered Thesis Planning Assistant';
export const APP_VERSION = '1.0.0';

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROJECT: (id: string) => `/project/${id}`,
  SETTINGS: '/settings',
} as const;

// ============================================
// NODE TYPES & LEVELS
// ============================================

export const NODE_TYPES = {
  PHASE: 'phase',
  STEP: 'step',
  SUBSTEP: 'substep',
  CHECKLIST: 'checklist',
} as const;

export const NODE_LEVELS = {
  PHASE: 1,
  STEP: 2,
  SUBSTEP: 3,
  CHECKLIST: 4,
} as const;

// ============================================
// NODE STATUS
// ============================================

export const NODE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
} as const;

export const NODE_STATUS_COLORS = {
  pending: 'rgba(148, 163, 184, 0.8)', // gray
  in_progress: 'rgba(59, 130, 246, 0.8)', // blue
  completed: 'rgba(34, 197, 94, 0.8)', // green
  blocked: 'rgba(239, 68, 68, 0.8)', // red
} as const;

// ============================================
// NODE PRIORITY
// ============================================

export const NODE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const NODE_PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
} as const;

// ============================================
// EDGE TYPES
// ============================================

export const EDGE_TYPES = {
  DEPENDENCY: 'dependency',
  SEQUENCE: 'sequence',
  RELATED: 'related',
} as const;

// ============================================
// AI AGENT ACTION TYPES
// ============================================

export const AGENT_ACTION_TYPES = {
  GENERATE_PLAN: 'generate_plan',
  REFINE_NODE: 'refine_node',
  BREAK_DOWN: 'break_down',
  ADD_MISSING: 'add_missing',
  REORGANIZE: 'reorganize',
  ANALYZE_PROGRESS: 'analyze_progress',
  SUGGEST_NEXT: 'suggest_next',
  EXPLAIN: 'explain',
  CHAT: 'chat',
} as const;

// ============================================
// RESOURCE TYPES
// ============================================

export const RESOURCE_TYPES = {
  PAPER: 'paper',
  TUTORIAL: 'tutorial',
  DATASET: 'dataset',
  TOOL: 'tool',
  DOCUMENTATION: 'documentation',
} as const;

// ============================================
// CHAT ROLES
// ============================================

export const CHAT_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  SYSTEM: 'system',
} as const;

// ============================================
// VISUAL CHANGE TYPES
// ============================================

export const VISUAL_CHANGE_TYPES = {
  HIGHLIGHT: 'highlight',
  ANIMATE: 'animate',
  FOCUS: 'focus',
  CONNECT: 'connect',
} as const;

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_NODE_WIDTH = 280;
export const DEFAULT_NODE_HEIGHT = 180;
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// ============================================
// GEMINI MODEL SETTINGS
// ============================================

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-pro-latest',
  FLASH_MODEL: 'gemini-2.0-flash-exp',
  EMBEDDING_MODEL: 'text-embedding-004',
  EMBEDDING_DIMENSIONS: 1536,
  TEMPERATURE: 0.7,
  MAX_TOKENS: 8192,
  RATE_LIMIT_PER_MINUTE: 2,
  FLASH_RATE_LIMIT_PER_MINUTE: 10,
} as const;

// ============================================
// RAG SETTINGS
// ============================================

export const RAG_CONFIG = {
  DEFAULT_TOP_K: 5,
  SIMILARITY_THRESHOLD: 0.7,
  MAX_CONTEXT_NODES: 10,
  EMBEDDING_BATCH_SIZE: 100,
} as const;

// ============================================
// PROMPT TEMPLATES
// ============================================

export const SYSTEM_PROMPTS = {
  planner: `You are an expert thesis advisor specializing in creating comprehensive academic roadmaps for students. You help students break down their thesis journey into manageable, actionable steps with realistic timelines.

Your output MUST be valid JSON following this structure:
{
  "phases": [...],  // 5-8 major phases
  "reasoning": "...", // Why this structure
  "estimatedDuration": "6 months"
}

Consider: Indonesian academic standards, student's jurusan, timeline constraints.`,

  refiner: `You are a detail-oriented academic advisor who improves thesis step descriptions. When given a step, you:
1. Analyze the current description
2. Add specific, actionable details
3. Suggest concrete checkpoints
4. Recommend relevant resources
5. Estimate realistic time requirements

Output JSON: { "improved": {...}, "reasoning": "..." }`,

  analyzer: `You are a progress analyst who helps students understand their thesis status. Given project context, you:
1. Identify completed vs pending work
2. Detect potential blockers
3. Suggest priority tasks
4. Estimate time to completion
5. Provide motivational insights

Be encouraging but realistic.`,

  modifier: `You are a structural expert who reorganizes thesis plans. You can:
1. Break down complex tasks into subtasks
2. Reorder steps for better flow
3. Add missing steps
4. Fix dependency issues
5. Optimize critical path

Always explain your reasoning clearly.`,
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: 'Invalid email address',
    WEAK_PASSWORD: 'Password must be at least 6 characters',
    USER_NOT_FOUND: 'User not found',
    WRONG_PASSWORD: 'Incorrect password',
    EMAIL_IN_USE: 'Email already in use',
    GOOGLE_AUTH_FAILED: 'Google authentication failed',
  },
  PROJECT: {
    NOT_FOUND: 'Project not found',
    UNAUTHORIZED: 'You do not have access to this project',
    CREATE_FAILED: 'Failed to create project',
    UPDATE_FAILED: 'Failed to update project',
    DELETE_FAILED: 'Failed to delete project',
  },
  NODE: {
    NOT_FOUND: 'Node not found',
    CREATE_FAILED: 'Failed to create node',
    UPDATE_FAILED: 'Failed to update node',
    DELETE_FAILED: 'Failed to delete node',
  },
  AI: {
    GENERATION_FAILED: 'AI generation failed',
    RATE_LIMITED: 'Rate limit exceeded. Please try again later.',
    EMBEDDING_FAILED: 'Failed to generate embedding',
    CONTEXT_TOO_LARGE: 'Context is too large. Please try with fewer nodes.',
  },
  NETWORK: {
    NO_CONNECTION: 'No internet connection',
    REQUEST_FAILED: 'Request failed. Please try again.',
    TIMEOUT: 'Request timed out',
  },
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  AUTH: {
    SIGNED_IN: 'Successfully signed in',
    SIGNED_UP: 'Account created successfully',
    SIGNED_OUT: 'Successfully signed out',
  },
  PROJECT: {
    CREATED: 'Project created successfully',
    UPDATED: 'Project updated successfully',
    DELETED: 'Project deleted successfully',
  },
  NODE: {
    CREATED: 'Node created successfully',
    UPDATED: 'Node updated successfully',
    DELETED: 'Node deleted successfully',
  },
  AI: {
    GENERATED: 'Roadmap generated successfully',
    REFINED: 'Node refined successfully',
    BREAKDOWN_COMPLETE: 'Task broken down successfully',
  },
} as const;

// ============================================
// COMMON JURUSAN (Indonesian University Majors)
// ============================================

export const COMMON_JURUSAN = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Teknik Elektro',
  'Teknik Mesin',
  'Teknik Sipil',
  'Psikologi',
  'Manajemen',
  'Akuntansi',
  'Ekonomi',
  'Hukum',
  'Kedokteran',
  'Farmasi',
  'Biologi',
  'Kimia',
  'Fisika',
  'Matematika',
  'Arsitektur',
  'Desain Grafis',
  'Komunikasi',
] as const;

// ============================================
// TIMELINE OPTIONS
// ============================================

export const TIMELINE_OPTIONS = [
  '3 months',
  '4 months',
  '5 months',
  '6 months',
  '8 months',
  '10 months',
  '12 months',
  '18 months',
] as const;

