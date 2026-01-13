import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't expose environment variable names in error messages
  console.error('Failed to initialize authentication service');
  throw new Error('Authentication service is not properly configured. Please try again later.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      poems: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          is_public: boolean;
          word_count: number;
          created_at: string;
          updated_at: string;
          favorited: boolean;
        };
        Insert: Omit<Database['public']['Tables']['poems']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['poems']['Insert']>;
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      writing_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          poems_written: number;
          words_written: number;
          minutes_writing: number;
        };
        Insert: Omit<Database['public']['Tables']['writing_stats']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['writing_stats']['Insert']>;
      };
    };
  };
}
