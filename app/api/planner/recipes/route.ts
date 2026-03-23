import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/planner/recipes?q=search — recipes to pick from in the modal
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  let query = supabase
    .from('recipes')
    .select('id, recipe_name, platform, video_summary, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  if (q) {
    query = query.ilike('recipe_name', `%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recipes: data ?? [] })
}
