import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RecipeCard from '@/components/RecipeCard'
import HeroUrlInput from '@/components/HeroUrlInput'
import type { Recipe } from '@/types'

export const revalidate = 60 // rebuild at most once per minute

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, recipe_name, video_url, video_summary, platform, created_at, formatted_message')
    .not('recipe_name', 'is', null)
    .not('recipe_name', 'eq', '')
    .not('formatted_message', 'is', null)
    .not('formatted_message', 'eq', '')
    .order('created_at', { ascending: false })
    .limit(30)

  // Deduplicate by video_url — keep the most recent entry per URL
  const seen = new Set<string>()
  const recipeList = ((recipes ?? []) as Recipe[])
    .filter((r) => {
      if (seen.has(r.video_url)) return false
      seen.add(r.video_url)
      return true
    })
    .slice(0, 12)

  return (
    <div>
      {/* Hero Section */}
      <section className="text-white" style={{ background: 'var(--primary-coral)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Amiri, serif' }}>
            Machla
          </h1>
          <p className="text-xl sm:text-2xl mb-3 max-w-2xl mx-auto leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.95)' }}>
            حوّل فيديوهات الطبخ إلى وصفات منظمة
          </p>
          <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.72)' }}>
            الصق رابط من يوتيوب أو تيك توك أو إنستغرام وسنستخرج لك الوصفة كاملة
          </p>

          {/* URL Input */}
          <HeroUrlInput />

          {/* Platform pills */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>يدعم:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#ff0000', color: 'white' }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>
              يوتيوب
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#010101', color: 'white' }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
              تيك توك
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              إنستغرام
            </span>
          </div>

          {/* Planner CTA */}
          <div className="mt-5 max-w-xl mx-auto">
            <Link
              href="/planner"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
              style={{ backgroundColor: '#16a34a', color: 'white' }}
            >
              <span>🗓️</span>
              <span>اختر وجباتك المفضلة وحوّلهم لقائمة ماجلة أسبوعية</span>
              <span>←</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-10 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>مجاني</div>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">ثوانٍ</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>سرعة المعالجة</div>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">عربي</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>وصفات بالعربية</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-800 text-center mb-12">كيف يعمل؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: 'var(--soft-coral)' }}>
                🔗
              </div>
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Amiri, serif' }}>١. الصق الرابط</h3>
              <p className="text-gray-500 text-sm leading-relaxed">انسخ رابط فيديو الطبخ من يوتيوب أو تيك توك أو إنستغرام</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: 'var(--soft-coral)' }}>
                ⚡
              </div>
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Amiri, serif' }}>٢. المعالجة الفورية</h3>
              <p className="text-gray-500 text-sm leading-relaxed">نظامنا يتولى استخراج الوصفة في ثوانٍ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: 'var(--soft-coral)' }}>
                📋
              </div>
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Amiri, serif' }}>٣. احصل على الوصفة</h3>
              <p className="text-gray-500 text-sm leading-relaxed">وصفة منسقة بالكامل مع المكونات وخطوات التحضير بالعربية</p>
              <p className="text-sm font-semibold mt-1" style={{ color: 'var(--primary-coral)' }}>مع قائمة الماجلة اللي تحتاجها</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Recipes Feed */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-800">أحدث الوصفات</h2>
            <Link
              href="/process"
              className="font-medium text-sm flex items-center gap-1" style={{ color: 'var(--primary-coral)' }}
            >
              أضف وصفتك
              <span>+</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6">
              حدث خطأ أثناء تحميل الوصفات
            </div>
          )}

          {recipeList.length === 0 && !error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">لا توجد وصفات بعد</h3>
              <p className="text-stone-500 mb-6">كن أول من يضيف وصفة!</p>
              <Link
                href="/process"
                className="coral-btn inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl"
              >
                أضف أول وصفة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipeList.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
