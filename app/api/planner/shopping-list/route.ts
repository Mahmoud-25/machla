import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseIngredientsFromMessage } from '@/lib/utils'

// GET /api/planner/shopping-list?week=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const week = request.nextUrl.searchParams.get('week')
  if (!week) return NextResponse.json({ error: 'week مطلوب' }, { status: 400 })

  const { data: entries } = await supabase
    .from('meal_plan_entries')
    .select('recipe:recipes(recipe_name, formatted_message)')
    .eq('user_id', user.id)
    .eq('week_start', week)

  if (!entries || entries.length === 0) {
    return NextResponse.json({ ingredients: [] })
  }

  // Collect all ingredients across all recipes; deduplicate by name
  const seen = new Set<string>()
  const ingredients: Array<{ name: string; amount: string | null; recipe_name: string }> = []

  for (const entry of entries) {
    const recipe = entry.recipe as { recipe_name: string; formatted_message: string } | null
    if (!recipe?.formatted_message) continue
    const parsed = parseIngredientsFromMessage(recipe.formatted_message)
    for (const ing of parsed) {
      const key = ing.name.trim()
      if (!seen.has(key)) {
        seen.add(key)
        ingredients.push({ ...ing, recipe_name: recipe.recipe_name })
      }
    }
  }

  return NextResponse.json({ ingredients })
}
