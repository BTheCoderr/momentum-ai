import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Transform Supabase data to mobile app format
function transformGoalData(supabaseGoal: any) {
  return {
    id: supabaseGoal.id,
    title: supabaseGoal.title,
    description: supabaseGoal.description,
    progress: supabaseGoal.progress || 0,
    currentStreak: supabaseGoal.current_streak || 0,
    bestStreak: supabaseGoal.best_streak || 0,
    dueDate: supabaseGoal.deadline ? new Date(supabaseGoal.deadline).toLocaleDateString() : 'No deadline',
    status: supabaseGoal.status === 'active' ? 'on-track' : supabaseGoal.status,
    motivation: supabaseGoal.emotional_context || 'Personal growth and achievement',
    userId: supabaseGoal.user_id,
    habits: [
      { id: `${supabaseGoal.id}-habit-1`, title: 'Daily check-in', completed: false, goalId: supabaseGoal.id },
      { id: `${supabaseGoal.id}-habit-2`, title: 'Progress review', completed: true, goalId: supabaseGoal.id },
      { id: `${supabaseGoal.id}-habit-3`, title: 'Action step', completed: false, goalId: supabaseGoal.id },
    ]
  };
}

// GET - Fetch all goals for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    
    console.log('🔍 Fetching goals from Supabase...');
    
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${goals?.length || 0} goals from database`);
    
    // Transform data to match frontend expectations with safe fallbacks
    const transformedGoals = goals?.map(goal => ({
      id: goal.id,
      title: goal.title || 'Untitled Goal',
      description: goal.description || '',
      progress: Math.max(0, Math.min(100, goal.progress || 0)),
      status: goal.status || 'active',
      currentStreak: Math.max(0, goal.current_streak || 0),
      bestStreak: Math.max(0, goal.best_streak || goal.current_streak || 0),
      completionRate: Math.max(0, Math.min(100, goal.completion_rate || 0)),
      deadline: goal.deadline || null,
      category: goal.category || 'personal',
      priority: goal.priority || 'medium',
      habits: Array.isArray(goal.habits) ? goal.habits : [],
      milestones: Array.isArray(goal.milestones) ? goal.milestones : [],
      createdAt: goal.created_at || new Date().toISOString(),
      updatedAt: goal.updated_at || goal.created_at || new Date().toISOString(),
      lastCheckIn: goal.last_check_in || null,
      // Add mobile compatibility fields
      dueDate: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline',
      motivation: goal.emotional_context || 'Personal growth and achievement'
    })) || [];

    return NextResponse.json({ goals: transformedGoals });

  } catch (error) {
    console.error('❌ Goals fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch goals',
      goals: [] // Return empty array as fallback
    }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      category = 'personal',
      priority = 'medium',
      deadline,
      habits = [],
      userId = 'demo-user'
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    console.log('📝 Creating new goal:', { title, category, priority });

    const goalData = {
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      priority,
      deadline: deadline || null,
      habits: habits || [],
      status: 'active',
      progress: 0,
      current_streak: 0,
      best_streak: 0,
      completion_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: goal, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();

    if (error) {
      console.error('❌ Goal creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Goal created successfully:', goal.id);

    // Transform for frontend
    const transformedGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      progress: goal.progress,
      status: goal.status,
      currentStreak: goal.current_streak,
      bestStreak: goal.best_streak,
      completionRate: goal.completion_rate,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
      habits: goal.habits,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    };

    return NextResponse.json({ goal: transformedGoal }, { status: 201 });

  } catch (error) {
    console.error('❌ Goal creation error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT - Update an existing goal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      title,
      description,
      progress,
      status,
      category,
      priority,
      deadline,
      habits,
      currentStreak,
      bestStreak,
      completionRate
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    console.log('📝 Updating goal:', id);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (progress !== undefined) updateData.progress = Math.max(0, Math.min(100, progress));
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (habits !== undefined) updateData.habits = habits;
    if (currentStreak !== undefined) updateData.current_streak = currentStreak;
    if (bestStreak !== undefined) updateData.best_streak = bestStreak;
    if (completionRate !== undefined) updateData.completion_rate = completionRate;

    const { data: goal, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Goal update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Goal updated successfully:', id);

    // Transform for frontend
    const transformedGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      progress: goal.progress,
      status: goal.status,
      currentStreak: goal.current_streak,
      bestStreak: goal.best_streak,
      completionRate: goal.completion_rate,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
      habits: goal.habits,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    };

    return NextResponse.json({ goal: transformedGoal });

  } catch (error) {
    console.error('❌ Goal update error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE - Delete a goal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting goal:', id);

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Goal deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Goal deleted successfully:', id);

    return NextResponse.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('❌ Goal deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
} 