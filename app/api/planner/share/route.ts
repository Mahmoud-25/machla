import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/planner/share — toggle public sharing for a week
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { week_start } = await request.json()
  if (!week_start) return NextResponse.json({ error: 'week_start مطلوب' }, { status: 400 })

  // Get or create the week record
  const { data: existing } = await supabase
    .from('meal_plan_weeks')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', week_start)
    .maybeSingle()

  const newIsPublic = existing ? !existing.is_public : true

  const { data, error } = await supabase
    .from('meal_plan_weeks')
    .upsert(
      { user_id: user.id, week_start, is_public: newIsPublic },
      { onConflict: 'user_id,week_start' }
    )
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ is_public: data.is_public, share_token: data.share_token })
}
