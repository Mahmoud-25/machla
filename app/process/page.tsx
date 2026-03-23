'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import VideoUrlForm from '@/components/VideoUrlForm'
import RecipeDisplay from '@/components/RecipeDisplay'
import VideoEmbed from '@/components/VideoEmbed'
import type { Recipe } from '@/types'

function ProcessPageInner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedRecipe, setSavedRecipe] = useState<Recipe | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = searchParams.get('url')
    if (url) handleSubmit(url)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (url: string) => {
    setLoading(true)
    setError(null)
    setSavedRecipe(null)

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء المعالجة')
      }

      setSavedRecipe(data.recipe)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4 text-3xl">
          🎬
        </div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">أضف وصفة جديدة</h1>
        <p className="text-stone-500">
          الصق رابط فيديو الطبخ وسنستخرج لك الوصفة فوراً
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
        <VideoUrlForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div>
              <p className="text-stone-800 font-bold text-lg">جاري معالجة الفيديو...</p>
              <p className="text-stone-500 text-sm mt-1">قد يستغرق هذا بضع ثوانٍ</p>
            </div>
            <div className="flex gap-2 mt-2">
              {['تحليل الفيديو', 'استخراج الوصفة', 'الحفظ'].map((step, i) => (
                <span key={i} className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="font-bold text-red-700 mb-1">حدث خطأ</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium underline"
              >
                حاول مرة أخرى
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {savedRecipe && !loading && (
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-bold text-green-700">تم استخراج الوصفة بنجاح!</p>
              <p className="text-green-600 text-sm">يمكنك الاطلاع عليها في لوحة التحكم</p>
            </div>
            <Link
              href={`/recipe/${savedRecipe.id}`}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              عرض الوصفة
            </Link>
          </div>

          {/* Video Embed */}
          <VideoEmbed videoUrl={savedRecipe.video_url} platform={savedRecipe.platform} />

          {/* Recipe Display */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0e4e1' }}>
            <div className="px-6 py-4" style={{ background: 'var(--primary-coral)' }}>
              <h2 className="text-white font-bold text-xl">{savedRecipe.recipe_name}</h2>
              {savedRecipe.platform && (
                <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {savedRecipe.platform === 'youtube' ? '▶ يوتيوب' : savedRecipe.platform === 'tiktok' ? '♪ تيك توك' : '📸 إنستغرام'}
                </span>
              )}
            </div>
            <div className="p-6">
              <RecipeDisplay formattedMessage={savedRecipe.formatted_message} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              لوحة التحكم
            </Link>
            <button
              onClick={() => { setSavedRecipe(null); setError(null) }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              أضف وصفة أخرى
              <span>+</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProcessPage() {
  return (
    <Suspense>
      <ProcessPageInner />
    </Suspense>
  )
}
