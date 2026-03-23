export interface Recipe {
  id: string
  user_id: string | null
  video_url: string
  platform: 'youtube' | 'tiktok' | 'instagram' | null
  recipe_name: string
  video_summary: string | null
  formatted_message: string
  created_at: string
}

export interface SavedRecipe {
  user_id: string
  recipe_id: string
  saved_at: string
  recipe?: Recipe
}

export interface MealPlanWeek {
  id: string
  user_id: string
  week_start: string
  is_public: boolean
  share_token: string
  created_at: string
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface MealPlanEntry {
  id: string
  user_id: string
  week_start: string
  day_of_week: number   // 0=السبت ... 6=الجمعة
  meal_slot: MealSlot
  recipe_id: string
  recipe?: Recipe
  created_at: string
}
