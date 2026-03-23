import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatShortDate } from '@/lib/utils'
import type { MealPlanEntry, MealSlot } from '@/types'

const DAYS: { key: number; label: string }[] = [
  { key: 0, label: 'السبت' },
  { key: 1, label: 'الأحد' },
  { key: 2, label: 'الاثنين' },
  { key: 3, label: 'الثلاثاء' },
  { key: 4, label: 'الأربعاء' },
  { key: 5, label: 'الخميس' },
  { key: 6, label: 'الجمعة' },
]

const SLOTS: { key: MealSlot; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'فطور', emoji: '☕' },
  { key: 'lunch', label: 'غداء', emoji: '🍽️' },
  { key: 'dinner', label: 'عشاء', emoji: '🌙' },
]

function getDayDate(weekStart: string, dayIndex: number): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + dayIndex)
  return d.toISOString().split('T')[0]
}

export default async function SharedPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Look up the public week by token
  const { data: weekRow } = await supabase
    .from('meal_plan_weeks')
    .select('*')
    .eq('share_token', token)
    .eq('is_public', true)
    .maybeSingle()

  if (!weekRow) notFound()

  // Fetch entries with recipes
  const { data: entries } = await supabase
    .from('meal_plan_entries')
    .select('*, recipe:recipes(*)')
    .eq('user_id', weekRow.user_id)
    .eq('week_start', weekRow.week_start)

  const entryList: MealPlanEntry[] = (entries ?? []) as MealPlanEntry[]

  function getEntry(day: number, slot: MealSlot) {
    return entryList.find((e) => e.day_of_week === day && e.meal_slot === slot) ?? null
  }

  const weekEnd = getDayDate(weekRow.week_start, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-2" style={{ border: '1px solid #bbf7d0' }}>
            🔗 خطة مشتركة
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}>
            📅 مخطط الوجبات الأسبوعي
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatShortDate(weekRow.week_start)} — {formatShortDate(weekEnd)}
          </p>
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--soft-coral)', color: 'var(--primary-coral)', border: '1px solid #f0e4e1' }}
        >
          أنشئ مخططك الخاص
        </Link>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '6px', minWidth: '700px' }}>
          <thead>
            <tr>
              <th className="w-16" />
              {DAYS.map((day) => (
                <th key={day.key} className="text-center pb-1">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold" style={{ color: '#1a1a1a' }}>{day.label}</span>
                    <span className="text-xs text-gray-400">{formatShortDate(getDayDate(weekRow.week_start, day.key))}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot.key}>
                <td className="text-center align-middle">
                  <div
                    className="inline-flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
                    style={{ background: 'var(--soft-coral)' }}
                  >
                    <span className="text-base">{slot.emoji}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--primary-coral)' }}>{slot.label}</span>
                  </div>
                </td>

                {DAYS.map((day) => {
                  const entry = getEntry(day.key, slot.key)
                  return (
                    <td key={day.key} className="align-top">
                      {entry ? (
                        <Link
                          href={`/recipe/${entry.recipe_id}`}
                          className="block w-full min-h-[80px] rounded-xl p-2.5 hover:shadow-md transition-shadow"
                          style={{
                            background: 'white',
                            border: '1px solid #f0e4e1',
                            borderRight: '3px solid var(--primary-coral)',
                          }}
                        >
                          <p
                            className="text-xs font-bold leading-snug line-clamp-3"
                            style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}
                          >
                            {entry.recipe?.recipe_name ?? '...'}
                          </p>
                        </Link>
                      ) : (
                        <div
                          className="w-full min-h-[80px] rounded-xl flex items-center justify-center"
                          style={{ border: '2px dashed #f0e4e1' }}
                        >
                          <span className="text-gray-200 text-xl">—</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
