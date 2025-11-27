import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Session = {
  id: string;
  user_id?: string;
  started_at: string;
  completed_at?: string;
  mind_weather?: string;
  thoughts_explored: number;
  average_intensity?: number;
  emotions_data: Record<string, number>;
  overall_reflection?: string;
  created_at: string;
};

export type Thought = {
  id: string;
  session_id: string;
  thought_text: string;
  can_change?: string;
  helps_or_hurts?: string;
  primary_feeling?: string;
  reflection?: string;
  intensity?: number;
  category?: string;
  theme?: string;
  color?: string;
  created_at: string;
};
