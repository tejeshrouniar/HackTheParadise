import { supabase } from './supabase';

export async function loadPlayerProgress(userId: string): Promise<number[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('player_progress')
    .select('completed_lessons')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.completed_lessons ?? null;
}

