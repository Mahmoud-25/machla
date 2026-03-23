import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RecipeCard from '@/components/RecipeCard'
import type { Recipe } from '@/types'

export const revalidate = 60 // rebuild at most once per minute

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, recipe_name, video_url, video_summary, platform, created_at')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span>🎬</span>
            <span>يوتيوب · تيك توك · إنستغرام</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Amiri, serif' }}>
            Machla
          </h1>
          <p className="text-xl sm:text-2xl mb-3 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
            حوّل فيديوهات الطبخ إلى وصفات منظمة
          </p>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            الصق رابط من يوتيوب أو تيك توك أو إنستغرام وسنستخرج لك الوصفة الكاملة بالمكونات وخطوات التحضير
          </p>
          <Link
            href="/process"
            className="inline-flex items-center gap-3 bg-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
            style={{ color: 'var(--primary-coral)' }}
          >
            <span>ابدأ الآن</span>
            <span className="text-2xl">←</span>
          </Link>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>مجاني</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">ثوانٍ</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>سرعة المعالجة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">عربي</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>وصفات بالعربية</div>
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
              <p className="text-gray-500 text-sm leading-relaxed">يقوم الذكاء الاصطناعي بتحليل الفيديو واستخراج الوصفة في ثوانٍ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: 'var(--soft-coral)' }}>
                📋
              </div>
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Amiri, serif' }}>٣. احصل على الوصفة</h3>
              <p className="text-gray-500 text-sm leading-relaxed">وصفة منسقة بالكامل مع المكونات وخطوات التحضير بالعربية</p>
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
