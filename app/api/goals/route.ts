import { NextRequest, NextResponse } from "next/server"
import { supabase, Goal } from "@/lib/supabase"

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

    console.log(`✅ Successfully fetched ${goals?.length || 0} goals from database`)
    return NextResponse.json(goals || [])
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

    console.log('✅ Goal created successfully in database!')
    return NextResponse.json(data, { status: 201 })
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

    console.log('✅ Goal updated successfully!')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
} 