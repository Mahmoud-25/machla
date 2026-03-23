export const maxDuration = 60 // seconds — tells Netlify/Vercel to allow up to 60s

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform } from '@/lib/utils'

interface N8nResponse {
  formattedMessage: string
  recipe_name: string
  video_summary: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { videoUrl } = body

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { error: 'رابط الفيديو مطلوب' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(videoUrl)
    } catch {
      return NextResponse.json(
        { error: 'رابط الفيديو غير صالح' },
        { status: 400 }
      )
    }

    // Detect platform
    const platform = detectPlatform(videoUrl)
    if (!platform) {
      return NextResponse.json(
        { error: 'الرابط غير مدعوم. يرجى استخدام رابط من يوتيوب أو تيك توك أو إنستغرام' },
        { status: 400 }
      )
    }

    // Build authenticated Supabase client using user's session
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

    // Check if URL was already processed by anyone
    const { data: existingList } = await supabase
      .from('recipes')
      .select('*')
      .eq('video_url', videoUrl)
      .order('created_at', { ascending: false })
      .limit(1)

    const existing = existingList?.[0] ?? null
    if (existing) {
      console.log('[cache] returning existing recipe id:', existing.id)
      return NextResponse.json({ success: true, recipe: existing, cached: true })
    }

    // Call n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      return NextResponse.json(
        { error: 'خطأ في إعداد الخادم' },
        { status: 500 }
      )
    }

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl }),
      signal: AbortSignal.timeout(180_000), // 3 min timeout for slow n8n workflows
    })

    const rawText = await n8nResponse.text()
    console.log('[n8n] status:', n8nResponse.status, 'body:', rawText.slice(0, 500))

    // Handle non-OK HTTP status
    if (!n8nResponse.ok) {
      console.error('[n8n] error response:', n8nResponse.status, rawText)
      return NextResponse.json(
        { error: 'تعذّر معالجة الفيديو. يرجى التأكد من صحة الرابط والمحاولة مرة أخرى' },
        { status: 502 }
      )
    }

    // Handle empty response
    if (!rawText || rawText.trim() === '') {
      console.error('[n8n] empty response body')
      return NextResponse.json(
        { error: 'لم يتم استخراج أي وصفة من هذا الفيديو. تأكد أن الفيديو يحتوي على وصفة طبخ' },
        { status: 422 }
      )
    }

    // Parse JSON
    let n8nData: N8nResponse[]
    try {
      const parsed = JSON.parse(rawText)

      // n8n sometimes returns an error object like { message: "..." }
      if (!Array.isArray(parsed) && parsed?.message && !parsed?.formattedMessage) {
        console.error('[n8n] workflow error:', parsed.message)
        return NextResponse.json(
          { error: 'فشل معالجة الفيديو. يرجى المحاولة مرة أخرى' },
          { status: 502 }
        )
      }

      n8nData = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      console.error('[n8n] JSON parse failed, raw:', rawText.slice(0, 500))
      return NextResponse.json(
        { error: 'تعذّر قراءة استجابة معالج الوصفات. يرجى المحاولة مرة أخرى' },
        { status: 502 }
      )
    }

    if (n8nData.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم استخراج أي وصفة من هذا الفيديو' },
        { status: 422 }
      )
    }

    const { formattedMessage, recipe_name, video_summary } = n8nData[0]
    console.log('[n8n] recipe_name:', recipe_name, 'msg length:', formattedMessage?.length)

    if (!formattedMessage || !recipe_name) {
      console.error('[n8n] incomplete data:', { formattedMessage: !!formattedMessage, recipe_name: !!recipe_name })
      return NextResponse.json(
        { error: 'لم نتمكن من استخراج الوصفة من هذا الفيديو. تأكد أن الفيديو يحتوي على وصفة طبخ واضحة' },
        { status: 422 }
      )
    }

    // Save to Supabase (RLS applies — user_id set from auth session)
    const { data: savedRecipe, error: insertError } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        video_url: videoUrl,
        platform,
        recipe_name,
        video_summary: video_summary ?? null,
        formatted_message: formattedMessage,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[supabase] insert error:', JSON.stringify(insertError))
      return NextResponse.json(
        { error: `فشل حفظ الوصفة: ${insertError.message}` },
        { status: 500 }
      )
    }
    console.log('[supabase] recipe saved, id:', savedRecipe?.id)

    return NextResponse.json({ success: true, recipe: savedRecipe })
  } catch (err: unknown) {
    console.error('process-video error:', err)
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')
    return NextResponse.json(
      { error: isTimeout
          ? 'استغرقت المعالجة وقتاً طويلاً. يرجى المحاولة مرة أخرى'
          : 'حدث خطأ غير متوقع' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
