import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/planner/basket?week=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const week = request.nextUrl.searchParams.get('week')
  if (!week) return NextResponse.json({ error: 'week مطلوب' }, { status: 400 })

  const { data, error } = await supabase
    .from('grocery_basket_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', week)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

// POST /api/planner/basket — add item to basket
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { week_start, ingredient_name, amount } = await request.json()
  if (!week_start || !ingredient_name) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const { data, error } = await supabase
    .from('grocery_basket_items')
    .upsert(
      { user_id: user.id, week_start, ingredient_name, amount: amount ?? null, is_bought: false },
      { onConflict: 'user_id,week_start,ingredient_name', ignoreDuplicates: false }
    )
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

// PATCH /api/planner/basket — toggle is_bought
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { week_start, ingredient_name, is_bought } = await request.json()
  if (!week_start || !ingredient_name || is_bought == null) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const { error } = await supabase
    .from('grocery_basket_items')
    .update({ is_bought })
    .eq('user_id', user.id)
    .eq('week_start', week_start)
    .eq('ingredient_name', ingredient_name)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/planner/basket?week=YYYY-MM-DD&name=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const week = request.nextUrl.searchParams.get('week')
  const name = request.nextUrl.searchParams.get('name')
  if (!week || !name) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const { error } = await supabase
    .from('grocery_basket_items')
    .delete()
    .eq('user_id', user.id)
    .eq('week_start', week)
    .eq('ingredient_name', name)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
