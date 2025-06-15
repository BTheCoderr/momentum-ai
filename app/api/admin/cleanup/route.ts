import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting database cleanup...')
    
    // Delete all goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .neq('id', 'keep-this-id-that-doesnt-exist') // This deletes all rows
    
    if (goalsError) {
      console.error('❌ Error deleting goals:', goalsError)
      return NextResponse.json({ error: 'Failed to delete goals' }, { status: 500 })
    }

    // Delete all habits if table exists
    const { error: habitsError } = await supabase
      .from('habits')
      .delete()
      .neq('id', 'keep-this-id-that-doesnt-exist')
    
    if (habitsError && !habitsError.message.includes('relation "habits" does not exist')) {
      console.error('❌ Error deleting habits:', habitsError)
    }

    // Delete all achievements if table exists
    const { error: achievementsError } = await supabase
      .from('achievements')
      .delete()
      .neq('id', 'keep-this-id-that-doesnt-exist')
    
    if (achievementsError && !achievementsError.message.includes('relation "achievements" does not exist')) {
      console.error('❌ Error deleting achievements:', achievementsError)
    }

    // Delete all check-ins if table exists
    const { error: checkinsError } = await supabase
      .from('checkins')
      .delete()
      .neq('id', 'keep-this-id-that-doesnt-exist')
    
    if (checkinsError && !checkinsError.message.includes('relation "checkins" does not exist')) {
      console.error('❌ Error deleting check-ins:', checkinsError)
    }

    console.log('✅ Database cleanup completed successfully!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All mock data has been cleaned from the database' 
    })
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    return NextResponse.json({ error: 'Failed to cleanup database' }, { status: 500 })
  }
} 