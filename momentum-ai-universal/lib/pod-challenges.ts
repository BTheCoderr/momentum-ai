import { supabase } from './supabase';

export interface PodChallenge {
  id: string;
  title: string;
  for_pod: boolean;
  pod_id: string | null;
  created_at: string;
  user_id: string;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_days: number[];
  last_updated: string;
}

export interface PodVote {
  id: string;
  pod_id: string;
  title: string;
  options: string[];
  votes: Record<string, string>;
  created_at: string;
  expires_at?: string;
}

export interface PodXPLog {
  id: string;
  pod_id: string;
  user_id: string;
  source: 'checkin' | 'challenge' | 'support' | 'invite' | 'vote';
  points: number;
  created_at: string;
}

// Challenge Progress Tracking
export async function updateChallengeProgress(
  userId: string, 
  challengeId: string, 
  day: number
): Promise<ChallengeProgress | null> {
  try {
    const { data: existing } = await supabase
      .from('challenge_progress')
      .select('completed_days')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    const completedDays = existing?.completed_days || [];
    const updatedDays = completedDays.includes(day) 
      ? completedDays 
      : [...completedDays, day].sort((a, b) => a - b);

    const { data, error } = await supabase
      .from('challenge_progress')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        completed_days: updatedDays,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Award XP for challenge progress
    if (!completedDays.includes(day)) {
      const challenge = await getChallenge(challengeId);
      if (challenge?.pod_id) {
        await awardPodXP(challenge.pod_id, userId, 'challenge', 15);
      }
    }

    return data;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return null;
  }
}

export async function getChallengeProgress(
  userId: string, 
  challengeId: string
): Promise<ChallengeProgress | null> {
  try {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting challenge progress:', error);
    return null;
  }
}

// Pod XP System
export async function awardPodXP(
  podId: string,
  userId: string,
  source: PodXPLog['source'],
  points: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('pod_xp_log')
      .insert({
        pod_id: podId,
        user_id: userId,
        source,
        points
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error awarding pod XP:', error);
  }
}

export async function getPodXP(podId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('pod_xp_log')
      .select('points')
      .eq('pod_id', podId);

    if (error) throw error;
    return (data || []).reduce((sum, log) => sum + log.points, 0);
  } catch (error) {
    console.error('Error getting pod XP:', error);
    return 0;
  }
}

export async function getPodLeaderboard(): Promise<Array<{pod_id: string, total_xp: number, pod_name: string}>> {
  try {
    const { data, error } = await supabase.rpc('get_pod_xp_totals');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting pod leaderboard:', error);
    return [];
  }
}

// Pod Voting System
export async function createPodVote(
  podId: string,
  title: string,
  options: string[],
  expiresInHours?: number
): Promise<PodVote | null> {
  try {
    const expiresAt = expiresInHours 
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : undefined;

    const { data, error } = await supabase
      .from('pod_votes')
      .insert({
        pod_id: podId,
        title,
        options,
        votes: {},
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating pod vote:', error);
    return null;
  }
}

export async function voteOnPodGoal(
  voteId: string,
  userId: string,
  option: string
): Promise<void> {
  try {
    const { data: vote } = await supabase
      .from('pod_votes')
      .select('votes, pod_id')
      .eq('id', voteId)
      .single();

    if (!vote) throw new Error('Vote not found');

    const newVotes = { ...vote.votes, [userId]: option };

    const { error } = await supabase
      .from('pod_votes')
      .update({ votes: newVotes })
      .eq('id', voteId);

    if (error) throw error;

    // Award XP for voting
    await awardPodXP(vote.pod_id, userId, 'vote', 5);
  } catch (error) {
    console.error('Error voting on pod goal:', error);
    throw error;
  }
}

export async function getPodVotes(podId: string): Promise<PodVote[]> {
  try {
    const { data, error } = await supabase
      .from('pod_votes')
      .select('*')
      .eq('pod_id', podId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting pod votes:', error);
    return [];
  }
}

// Existing functions from previous implementation
export async function createChallenge(
  userId: string, 
  title: string, 
  forPod: boolean = false, 
  podId: string | null = null
): Promise<PodChallenge | null> {
  const { data, error } = await supabase
    .from('custom_challenges')
    .insert([{
      user_id: userId,
      title,
      for_pod: forPod,
      pod_id: podId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating challenge:', error);
    return null;
  }

  return data;
}

export async function getChallenge(challengeId: string): Promise<PodChallenge | null> {
  try {
    const { data, error } = await supabase
      .from('custom_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting challenge:', error);
    return null;
  }
}

export async function getUserChallenges(userId: string): Promise<PodChallenge[]> {
  const { data, error } = await supabase
    .from('custom_challenges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }

  return data || [];
}

export async function getPodChallenges(podId: string): Promise<PodChallenge[]> {
  const { data, error } = await supabase
    .from('custom_challenges')
    .select('*')
    .eq('pod_id', podId)
    .eq('for_pod', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pod challenges:', error);
    return [];
  }

  return data || [];
}

export async function setPodWeeklyChallenge(podId: string, challenge: string): Promise<void> {
  const { error } = await supabase
    .from('pods')
    .update({ weekly_challenge: challenge })
    .eq('id', podId);

  if (error) {
    console.error('Error setting pod challenge:', error);
    throw error;
  }
}

export async function getPodWeeklyChallenge(podId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('pods')
    .select('weekly_challenge')
    .eq('id', podId)
    .single();

  if (error || !data) {
    console.error('Error fetching pod challenge:', error);
    return null;
  }

  return data.weekly_challenge;
}

export async function getPublicPods(): Promise<any[]> {
  const { data, error } = await supabase
    .from('pods')
    .select(`
      id,
      theme,
      description,
      weekly_challenge,
      invite_code,
      pod_members (count)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public pods:', error);
    return [];
  }

  return data || [];
}

// Pod Invite System
export async function generatePodInviteCode(podId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('generate_invite_code');
    if (error) throw error;

    const inviteCode = data;

    const { error: updateError } = await supabase
      .from('pods')
      .update({ invite_code: inviteCode })
      .eq('id', podId);

    if (updateError) throw updateError;
    
    return inviteCode;
  } catch (error) {
    console.error('Error generating invite code:', error);
    return null;
  }
}

export async function joinPodByInviteCode(userId: string, inviteCode: string): Promise<boolean> {
  try {
    const { data: pod } = await supabase
      .from('pods')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (!pod) throw new Error('Invalid invite code');

    const { error } = await supabase
      .from('pod_members')
      .insert({ user_id: userId, pod_id: pod.id });

    if (error) throw error;

    // Award XP for joining via invite
    await awardPodXP(pod.id, userId, 'invite', 20);

    return true;
  } catch (error) {
    console.error('Error joining pod by invite:', error);
    return false;
  }
} 