import { supabase } from "./supabase";

export async function updateStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_checkin, checkin_streak")
    .eq("id", userId)
    .single();

  if (!profile) {
    return 0;
  }

  const last = profile.last_checkin ? new Date(profile.last_checkin) : new Date(0);
  const diff = (new Date(today).getTime() - last.getTime()) / (1000 * 3600 * 24);

  let newStreak = profile.checkin_streak || 0;

  if (diff === 1) {
    // Perfect streak - increment
    newStreak += 1;
  } else if (diff > 1) {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  await supabase.from("profiles").update({
    last_checkin: today,
    checkin_streak: newStreak,
  }).eq("id", userId);

  return newStreak;
}

export async function updateXP(userId: string, action: 'checkin' | 'goal_progress' | 'pod_message'): Promise<{xp: number, badge: string}> {
  const baseXP = {
    checkin: 10,
    goal_progress: 15,
    pod_message: 5,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();

  const currentXP = profile?.xp || 0;
  const newXP = currentXP + baseXP[action];

  // Calculate badge based on XP
  let badge = "Starter";
  if (newXP >= 500) badge = "Streak Master";
  else if (newXP >= 300) badge = "Mindful Beast";
  else if (newXP >= 100) badge = "Consistency Rookie";

  await supabase
    .from("profiles")
    .update({ xp: newXP, badge })
    .eq("id", userId);

  return { xp: newXP, badge };
}

export async function getDailyCheckins(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("checkins")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

  return (data || []).map(c => new Date(c.created_at).toISOString().split("T")[0]);
} 