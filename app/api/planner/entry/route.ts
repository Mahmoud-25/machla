import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/planner/entry — add or replace a meal
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { week_start, day_of_week, meal_slot, recipe_id } = await request.json()
  if (!week_start || day_of_week == null || !meal_slot || !recipe_id) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  // Step 1: upsert — no join here (join on upsert can silently fail)
  const { data: upserted, error } = await supabase
    .from('meal_plan_entries')
    .upsert(
      { user_id: user.id, week_start, day_of_week, meal_slot, recipe_id },
      { onConflict: 'user_id,week_start,day_of_week,meal_slot' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('[planner/entry] upsert error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Step 2: fetch with recipe join separately
  const { data, error: joinError } = await supabase
    .from('meal_plan_entries')
    .select('*, recipe:recipes(*)')
    .eq('id', upserted.id)
    .single()

  if (joinError) return NextResponse.json({ entry: upserted })
  return NextResponse.json({ entry: data })
}

// DELETE /api/planner/entry?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

  const { error } = await supabase
    .from('meal_plan_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
