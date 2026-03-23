'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import VideoUrlForm from '@/components/VideoUrlForm'
import RecipeDisplay from '@/components/RecipeDisplay'
import VideoEmbed from '@/components/VideoEmbed'
import type { Recipe } from '@/types'

const platformConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  youtube: {
    label: 'يوتيوب',
    bg: '#fee2e2',
    color: '#b91c1c',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  tiktok: {
    label: 'تيك توك',
    bg: '#111827',
    color: '#ffffff',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  instagram: {
    label: 'إنستغرام',
    bg: '#fce7f3',
    color: '#9d174d',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
}

function ProcessPageInner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedRecipe, setSavedRecipe] = useState<Recipe | null>(null)
  const [recipeSaved, setRecipeSaved] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)
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
      setRecipeSaved(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async () => {
    if (!savedRecipe || savingToggle) return
    setSavingToggle(true)
    try {
      const res = await fetch('/api/toggle-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: savedRecipe.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setRecipeSaved(data.saved)
      } else if (res.status === 401) {
        window.location.href = '/auth/login'
      }
    } catch (err) {
      console.error('toggle save error:', err)
    } finally {
      setSavingToggle(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

          {/* Recipe Info Card (under success banner) */}
          {(() => {
            const platform = savedRecipe.platform ? platformConfig[savedRecipe.platform] : null
            return (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #f0e4e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div className="h-1 w-full" style={{ background: 'var(--primary-coral)' }} />
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {platform && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: platform.bg, color: platform.color }}
                      >
                        {platform.icon}
                        {platform.label}
                      </span>
                    )}
                    <h3
                      className="text-lg font-bold truncate"
                      style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}
                    >
                      {savedRecipe.recipe_name}
                    </h3>
                  </div>
                  <button
                    onClick={handleToggleSave}
                    disabled={savingToggle}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 mr-2"
                    style={{
                      backgroundColor: recipeSaved ? '#fce7f3' : '#f5f5f4',
                      color: recipeSaved ? '#e06b53' : '#a8a29e',
                    }}
                    title={recipeSaved ? 'إلغاء الحفظ' : 'حفظ الوصفة'}
                  >
                    {savingToggle ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={recipeSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Side-by-side: Video (left) + Recipe (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Left: Video Embed */}
            <div>
              <VideoEmbed videoUrl={savedRecipe.video_url} platform={savedRecipe.platform} />
            </div>

            {/* Right: Recipe Display */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0e4e1' }}>
              <div className="p-6">
                <RecipeDisplay formattedMessage={savedRecipe.formatted_message} />
              </div>
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
