import { NextRequest, NextResponse } from "next/server"
import { supabase, Goal } from "@/lib/supabase"

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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching goals from Supabase...')
    
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }

    // Transform data to mobile app format
    const transformedGoals = (goals || []).map(transformGoalData);

    console.log(`✅ Successfully fetched ${transformedGoals.length} goals from database`)
    return NextResponse.json(transformedGoals)
  } catch (error) {
    console.error('❌ Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, emotionalContext, deadline, habits } = body
    
    console.log('🎯 Creating new goal:', title)
    
    const newGoal = {
      id: `goal-${Date.now()}`,
      title,
      description,
      emotional_context: emotionalContext,
      progress: 0,
      status: 'active',
      deadline: deadline || null,
      user_id: 'default-user'
    }

    const { data, error } = await supabase
      .from('goals')
      .insert(newGoal)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
    }

    // Transform and return the created goal
    const transformedGoal = transformGoalData(data);
    console.log('✅ Goal created successfully in database!')
    return NextResponse.json(transformedGoal, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, progress, status } = body
    
    console.log('📈 Updating goal progress:', id, progress)

    const { data, error } = await supabase
      .from('goals')
      .update({ 
        progress, 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    // Transform and return the updated goal
    const transformedGoal = transformGoalData(data);
    console.log('✅ Goal updated successfully!')
    return NextResponse.json(transformedGoal)
  } catch (error) {
    console.error('❌ Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
} 