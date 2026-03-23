import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeDisplay from '@/components/RecipeDisplay'
import SaveToggleButton from '@/components/SaveToggleButton'
import VideoEmbed from '@/components/VideoEmbed'
import { formatDate } from '@/lib/utils'
import type { Recipe } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const platformConfig = {
  youtube: { label: 'يوتيوب', color: 'bg-red-100 text-red-700 border-red-200', icon: '▶' },
  tiktok:  { label: 'تيك توك', color: 'bg-stone-900 text-white border-stone-700', icon: '♪' },
  instagram: { label: 'إنستغرام', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '📸' },
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get recipe
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const typedRecipe = recipe as Recipe

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if saved
  let isSaved = false
  if (user) {
    const { data: savedRecord } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_id', id)
      .single()
    isSaved = !!savedRecord
  }

  const platform = typedRecipe.platform ? platformConfig[typedRecipe.platform] : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 text-sm font-medium group"
      >
        <span className="group-hover:translate-x-0.5 transition-transform">←</span>
        العودة للرئيسية
      </Link>

      {/* Recipe Header */}
      <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: 'var(--primary-coral)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {platform && (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium mb-3 ${platform.color}`}>
                {platform.icon} {platform.label}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: 'Amiri, serif' }}>
              {typedRecipe.recipe_name}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatDate(typedRecipe.created_at)}
            </p>
          </div>
          {user && (
            <div className="flex-shrink-0">
              <SaveToggleButton recipeId={typedRecipe.id} initialSaved={isSaved} />
            </div>
          )}
        </div>
      </div>

      {/* Video Embed */}
      <VideoEmbed videoUrl={typedRecipe.video_url} platform={typedRecipe.platform} />

      {/* Video Summary */}
      {typedRecipe.video_summary && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--soft-coral)', border: '1px solid #f0e4e1' }}>
          <h2 className="font-bold mb-2 text-sm" style={{ color: 'var(--primary-coral)' }}>ملخص الفيديو</h2>
          <p className="text-sm leading-relaxed text-gray-600">{typedRecipe.video_summary}</p>
        </div>
      )}

      {/* Recipe Content */}
      <RecipeDisplay formattedMessage={typedRecipe.formatted_message} />

      {/* Auth CTA for guests */}
      {!user && (
        <div className="mt-6 rounded-2xl p-6 text-center" style={{ background: 'var(--soft-coral)', border: '1px solid #f0e4e1' }}>
          <p className="text-gray-700 font-medium mb-1">أعجبتك الوصفة؟</p>
          <p className="text-gray-500 text-sm mb-4">سجل دخولك لحفظ الوصفات وإضافة وصفات خاصة بك</p>
          <Link href="/auth/login" className="coral-btn inline-flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl">
            تسجيل الدخول مجاناً
          </Link>
        </div>
      )}
    </div>
  )
}
