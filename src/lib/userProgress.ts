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

export async function savePlayerProgress(userId: string, completedLessons: number[]) {
  if (!supabase) return;
  const { error } = await supabase.from('player_progress').upsert({
    user_id: userId,
    completed_lessons: completedLessons,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw error;
}
