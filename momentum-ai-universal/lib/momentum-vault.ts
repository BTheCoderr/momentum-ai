import { supabase } from './supabase';

export interface VaultEntry {
  id: string;
  user_id: string;
  entry_type: 'checkin' | 'challenge' | 'goal' | 'ritual';
  ref_id: string;
  highlight: string;
  tags: string[];
  created_at: string;
}

export interface VaultStats {
  total_entries: number;
  entries_by_type: Record<string, number>;
  most_used_tags: string[];
  oldest_entry: string;
  recent_entries: number; // Last 7 days
}

export async function addToVault(
  userId: string,
  entryType: VaultEntry['entry_type'],
  refId: string,
  highlight: string,
  tags: string[] = []
): Promise<VaultEntry | null> {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .insert({
        user_id: userId,
        entry_type: entryType,
        ref_id: refId,
        highlight,
        tags
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding to vault:', error);
    return null;
  }
}

export async function getVaultEntries(
  userId: string,
  entryType?: VaultEntry['entry_type'],
  limit: number = 50
): Promise<VaultEntry[]> {
  try {
    let query = supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId);

    if (entryType) {
      query = query.eq('entry_type', entryType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting vault entries:', error);
    return [];
  }
}

export async function getVaultStats(userId: string): Promise<VaultStats> {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('entry_type, tags, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const entries = data || [];
    const totalEntries = entries.length;

    // Count by type
    const entriesByType = entries.reduce((acc, entry) => {
      acc[entry.entry_type] = (acc[entry.entry_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most used tags
    const allTags = entries.flatMap(entry => entry.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([tag]) => tag);

    // Recent entries (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter(
      entry => new Date(entry.created_at) > sevenDaysAgo
    ).length;

    // Oldest entry
    const oldestEntry = entries.length > 0 
      ? entries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at
      : '';

    return {
      total_entries: totalEntries,
      entries_by_type: entriesByType,
      most_used_tags: mostUsedTags,
      oldest_entry: oldestEntry,
      recent_entries: recentEntries
    };
  } catch (error) {
    console.error('Error getting vault stats:', error);
    return {
      total_entries: 0,
      entries_by_type: {},
      most_used_tags: [],
      oldest_entry: '',
      recent_entries: 0
    };
  }
}

export async function searchVault(
  userId: string,
  query: string,
  tags?: string[]
): Promise<VaultEntry[]> {
  try {
    let supabaseQuery = supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId);

    // Search in highlight text
    if (query.trim()) {
      supabaseQuery = supabaseQuery.ilike('highlight', `%${query}%`);
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', tags);
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching vault:', error);
    return [];
  }
}

export async function updateVaultEntry(
  entryId: string,
  updates: Partial<Pick<VaultEntry, 'highlight' | 'tags'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vault_entries')
      .update(updates)
      .eq('id', entryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating vault entry:', error);
    return false;
  }
}

export async function deleteVaultEntry(entryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting vault entry:', error);
    return false;
  }
}

// Suggest entries for vaulting based on check-ins and achievements
export async function suggestVaultEntries(userId: string): Promise<Array<{
  type: VaultEntry['entry_type'];
  ref_id: string;
  highlight: string;
  reason: string;
}>> {
  try {
    const suggestions: Array<{
      type: VaultEntry['entry_type'];
      ref_id: string;
      highlight: string;
      reason: string;
    }> = [];

    // Get recent check-ins with positive moods
    const { data: checkins } = await supabase
      .from('checkins')
      .select('id, entry, mood, created_at')
      .eq('user_id', userId)
      .in('mood', ['great', 'amazing', 'motivated', 'energized', 'happy', 'confident'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (checkins) {
      for (const checkin of checkins) {
        if (checkin.entry && checkin.entry.length > 50) { // Substantial entries
          suggestions.push({
            type: 'checkin',
            ref_id: checkin.id,
            highlight: checkin.entry.substring(0, 100) + (checkin.entry.length > 100 ? '...' : ''),
            reason: `Positive ${checkin.mood} check-in worth remembering`
          });
        }
      }
    }

    // Get recently completed goals
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, description, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(3);

    if (goals) {
      for (const goal of goals) {
        suggestions.push({
          type: 'goal',
          ref_id: goal.id,
          highlight: `Completed: ${goal.title}`,
          reason: 'Recent goal achievement'
        });
      }
    }

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  } catch (error) {
    console.error('Error getting vault suggestions:', error);
    return [];
  }
}

export async function getVaultEntriesByTag(
  userId: string,
  tag: string
): Promise<VaultEntry[]> {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting vault entries by tag:', error);
    return [];
  }
}

export async function getAllVaultTags(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('tags')
      .eq('user_id', userId);

    if (error) throw error;

    const allTags = (data || []).flatMap(entry => entry.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();
    
    return uniqueTags;
  } catch (error) {
    console.error('Error getting vault tags:', error);
    return [];
  }
}

// Suggested tags for common entry types
export const suggestedTags = {
  checkin: ['breakthrough', 'milestone', 'learning', 'gratitude', 'victory', 'insight'],
  goal: ['completed', 'major-goal', 'personal', 'professional', 'health', 'relationship'],
  challenge: ['7-day', '30-day', 'habit', 'fitness', 'mindfulness', 'productivity'],
  ritual: ['morning', 'evening', 'weekly', 'self-care', 'growth', 'reflection']
}; 