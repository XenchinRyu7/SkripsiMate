// Supabase Configuration & Client Setup
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================
// CLIENT-SIDE SUPABASE CLIENT (with RLS)
// ============================================

/**
 * Public Supabase client for client-side use
 * Protected by Row Level Security (RLS) policies
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================
// SERVER-SIDE SUPABASE ADMIN CLIENT (no RLS)
// ============================================

/**
 * Admin Supabase client for server-side use only
 * Bypasses RLS - use with caution!
 * Only for server actions and API routes
 */
export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Get Supabase client with Firebase user token
 * For authenticated requests from client-side
 */
export const getSupabaseWithAuth = async (firebaseToken: string): Promise<SupabaseClient> => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    },
  });
};

// ============================================
// DATABASE TYPES (will be generated from Supabase)
// ============================================

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          jurusan: string;
          timeline: string;
          description: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      nodes: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          type: 'phase' | 'step' | 'substep' | 'checklist';
          level: number;
          parent_id: string | null;
          order_index: number;
          status: 'pending' | 'in_progress' | 'completed' | 'blocked';
          priority: 'low' | 'medium' | 'high' | 'critical';
          position: any; // JSON
          metadata: any; // JSON
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['nodes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['nodes']['Insert']>;
      };
      node_embeddings: {
        Row: {
          id: string;
          project_id: string;
          node_id: string;
          content: string;
          content_hash: string;
          embedding: number[];
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['node_embeddings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['node_embeddings']['Insert']>;
      };
    };
  };
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type Node = Database['public']['Tables']['nodes']['Row'];
export type NodeEmbedding = Database['public']['Tables']['node_embeddings']['Row'];

