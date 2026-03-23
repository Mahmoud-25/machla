import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/planner?week=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const week = request.nextUrl.searchParams.get('week')
  if (!week) return NextResponse.json({ error: 'week مطلوب' }, { status: 400 })

  const [weekMeta, entries] = await Promise.all([
    supabase.from('meal_plan_weeks').select('*').eq('user_id', user.id).eq('week_start', week).maybeSingle(),
    supabase.from('meal_plan_entries').select('*, recipe:recipes(*)').eq('user_id', user.id).eq('week_start', week),
  ])

  return NextResponse.json({
    week: weekMeta.data ?? null,
    entries: entries.data ?? [],
  })
}
