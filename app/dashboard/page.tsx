import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RecipeCard from '@/components/RecipeCard'
import type { Recipe, SavedRecipe } from '@/types'

interface SearchParams {
  tab?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const activeTab = resolvedSearchParams.tab === 'saved' ? 'saved' : 'my'

  // Fetch user's own recipes
  const { data: myRecipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch saved recipes with joined recipe data
  const { data: savedRecordsRaw } = await supabase
    .from('saved_recipes')
    .select('*, recipe:recipes(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  const savedRecipes: SavedRecipe[] = (savedRecordsRaw as SavedRecipe[]) ?? []
  const myRecipeList: Recipe[] = (myRecipes as Recipe[]) ?? []

  // Get saved recipe IDs for the RecipeCard
  const savedRecipeIds = new Set(savedRecipes.map((s) => s.recipe_id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">لوحة التحكم</h1>
          <p className="text-stone-500 text-sm mt-1">{user.email}</p>
        </div>
        <Link
          href="/process"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <span>+</span>
          أضف وصفة
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">{myRecipeList.length}</div>
          <div className="text-stone-500 text-sm mt-1">وصفاتي</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-bold text-pink-500">{savedRecipes.length}</div>
          <div className="text-stone-500 text-sm mt-1">المحفوظات</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">
            {myRecipeList.filter((r) => r.platform === 'youtube').length}
          </div>
          <div className="text-stone-500 text-sm mt-1">من يوتيوب</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-bold text-stone-700">
            {myRecipeList.filter((r) => r.platform === 'tiktok').length + myRecipeList.filter((r) => r.platform === 'instagram').length}
          </div>
          <div className="text-stone-500 text-sm mt-1">من سوشيال</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-100 rounded-xl p-1 w-fit mb-8">
        <Link
          href="/dashboard?tab=my"
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'my'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          وصفاتي ({myRecipeList.length})
        </Link>
        <Link
          href="/dashboard?tab=saved"
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'saved'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          المحفوظات ({savedRecipes.length})
        </Link>
      </div>

      {/* Tab Content */}
      {activeTab === 'my' && (
        <div>
          {myRecipeList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="text-lg font-bold text-stone-700 mb-2">لا توجد وصفات بعد</h3>
              <p className="text-stone-500 mb-6 text-sm">أضف أول وصفة بلصق رابط فيديو</p>
              <Link
                href="/process"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                أضف وصفة الآن
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipeList.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedRecipeIds.has(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedRecipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <div className="text-5xl mb-4">🔖</div>
              <h3 className="text-lg font-bold text-stone-700 mb-2">لا توجد وصفات محفوظة</h3>
              <p className="text-stone-500 mb-6 text-sm">استعرض الوصفات واحفظ المفضلة منها</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                استعرض الوصفات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((saved) =>
                saved.recipe ? (
                  <RecipeCard
                    key={saved.recipe_id}
                    recipe={saved.recipe}
                    isSaved={true}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
