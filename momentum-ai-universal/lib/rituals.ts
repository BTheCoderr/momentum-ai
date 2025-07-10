import { supabase } from './supabase';

export interface Ritual {
  id: string;
  user_id: string;
  title: string;
  steps: string[];
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'any';
  repeat_days: number[]; // 0=Sunday, 6=Saturday
  is_active: boolean;
  created_at: string;
}

export interface RitualProgress {
  ritual_id: string;
  completed_dates: string[];
  current_streak: number;
  best_streak: number;
}

export async function createRitual(
  userId: string,
  title: string,
  steps: string[],
  timeOfDay: Ritual['time_of_day'] = 'any',
  repeatDays: number[] = [0, 1, 2, 3, 4, 5, 6]
): Promise<Ritual | null> {
  try {
    const { data, error } = await supabase
      .from('rituals')
      .insert({
        user_id: userId,
        title,
        steps,
        time_of_day: timeOfDay,
        repeat_days: repeatDays,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ritual:', error);
    return null;
  }
}

export async function getUserRituals(userId: string): Promise<Ritual[]> {
  try {
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching rituals:', error);
    return [];
  }
}

export async function updateRitual(
  ritualId: string,
  updates: Partial<Omit<Ritual, 'id' | 'user_id' | 'created_at'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rituals')
      .update(updates)
      .eq('id', ritualId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating ritual:', error);
    return false;
  }
}

export async function deleteRitual(ritualId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rituals')
      .update({ is_active: false })
      .eq('id', ritualId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting ritual:', error);
    return false;
  }
}

export async function completeRitual(
  userId: string,
  ritualId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<boolean> {
  try {
    // This would typically go to a ritual_completions table
    // For now, we'll use the vault_entries table to track completions
    const { error } = await supabase
      .from('vault_entries')
      .insert({
        user_id: userId,
        entry_type: 'ritual',
        ref_id: ritualId,
        highlight: `Completed ritual on ${date}`,
        tags: [date]
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing ritual:', error);
    return false;
  }
}

export async function getRitualProgress(
  userId: string,
  ritualId: string
): Promise<RitualProgress> {
  try {
    // Get completion history from vault_entries
    const { data, error } = await supabase
      .from('vault_entries')
      .select('tags, created_at')
      .eq('user_id', userId)
      .eq('ref_id', ritualId)
      .eq('entry_type', 'ritual')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const completedDates = (data || [])
      .map(entry => entry.tags?.[0])
      .filter(Boolean)
      .sort();

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < completedDates.length; i++) {
      const date = completedDates[i];
      const prevDate = i > 0 ? completedDates[i - 1] : null;
      
      if (prevDate) {
        const daysDiff = Math.floor(
          (new Date(date).getTime() - new Date(prevDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      // Check if this contributes to current streak
      if (date === today || 
          Math.floor(
            (new Date(today).getTime() - new Date(date).getTime()) / 
            (1000 * 60 * 60 * 24)
          ) <= tempStreak) {
        currentStreak = tempStreak;
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);

    return {
      ritual_id: ritualId,
      completed_dates: completedDates,
      current_streak: currentStreak,
      best_streak: bestStreak
    };
  } catch (error) {
    console.error('Error getting ritual progress:', error);
    return {
      ritual_id: ritualId,
      completed_dates: [],
      current_streak: 0,
      best_streak: 0
    };
  }
}

export async function getTodaysRituals(userId: string): Promise<Ritual[]> {
  try {
    const today = new Date().getDay(); // 0=Sunday, 6=Saturday
    
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .contains('repeat_days', [today]);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching today\'s rituals:', error);
    return [];
  }
}

export const defaultRitualTemplates = [
  {
    title: '🌅 Morning Momentum',
    steps: [
      'Stretch for 2 minutes',
      'Set 3 intentions for the day',
      'Take 5 deep breaths',
      'Review your goals'
    ],
    time_of_day: 'morning' as const,
    repeat_days: [1, 2, 3, 4, 5] // Weekdays
  },
  {
    title: '🌙 Evening Wind-Down',
    steps: [
      'Reflect on 3 wins from today',
      'Write in gratitude journal',
      'Plan tomorrow\'s top priority',
      'Practice relaxation breathing'
    ],
    time_of_day: 'evening' as const,
    repeat_days: [0, 1, 2, 3, 4, 5, 6] // Daily
  },
  {
    title: '💪 Midday Reset',
    steps: [
      'Step away from work',
      'Do 10 push-ups or squats',
      'Drink a glass of water',
      'Take a 2-minute mindfulness break'
    ],
    time_of_day: 'afternoon' as const,
    repeat_days: [1, 2, 3, 4, 5] // Weekdays
  },
  {
    title: '🎯 Weekly Planning',
    steps: [
      'Review last week\'s progress',
      'Set 3 goals for the coming week',
      'Schedule important tasks',
      'Prepare your workspace'
    ],
    time_of_day: 'any' as const,
    repeat_days: [0] // Sunday only
  }
]; 