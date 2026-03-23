import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipeId } = body

    if (!recipeId || typeof recipeId !== 'string') {
      return NextResponse.json(
        { error: 'معرّف الوصفة مطلوب' },
        { status: 400 }
      )
    }

    // Build authenticated Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
              })
            } catch {
              // ignore
            }
          },
        },
      }
    )

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .single()

    if (existing) {
      // Already saved → unsave
      const { error: deleteError } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)

      if (deleteError) {
        console.error('delete saved_recipe error:', deleteError)
        return NextResponse.json(
          { error: 'فشل إلغاء الحفظ' },
          { status: 500 }
        )
      }

      return NextResponse.json({ saved: false })
    } else {
      // Not saved → save
      const { error: insertError } = await supabase
        .from('saved_recipes')
        .insert({ user_id: user.id, recipe_id: recipeId })

      if (insertError) {
        console.error('insert saved_recipe error:', insertError)
        return NextResponse.json(
          { error: 'فشل حفظ الوصفة' },
          { status: 500 }
        )
      }

      return NextResponse.json({ saved: true })
    }
  } catch (err: unknown) {
    console.error('toggle-save error:', err)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
