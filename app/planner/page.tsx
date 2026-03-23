'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getWeekStart, shiftWeek, formatShortDate } from '@/lib/utils'
import type { MealPlanEntry, MealPlanWeek, Recipe, MealSlot } from '@/types'

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

// ─── Add Meal Modal ───────────────────────────────────────────────────────────
function AddMealModal({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (recipe: Recipe) => void
}) {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string) => {
    setLoading(true)
    fetch(`/api/planner/recipes?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { setRecipes(d.recipes ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { search('') }, [search])

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col" style={{ maxHeight: '80vh', border: '1px solid #f0e4e1' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f5f0ed' }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}>اختر وصفة</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">✕</button>
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f5f0ed' }}>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="ابحث عن وصفة..."
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid #f0e4e1', background: 'var(--soft-coral)' }}
          />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-3 py-2">
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">جاري البحث...</div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">لا توجد وصفات مطابقة</div>
          ) : (
            recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl mb-1 hover:bg-orange-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--soft-coral)' }}
                >
                  🍳
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate" style={{ fontFamily: 'Amiri, serif' }}>{r.recipe_name}</p>
                  {r.video_summary && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{r.video_summary}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Shopping List Modal ──────────────────────────────────────────────────────
function ShoppingListModal({
  week,
  onClose,
}: {
  week: string
  onClose: () => void
}) {
  const [items, setItems] = useState<Array<{ name: string; amount: string | null; recipe_name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/planner/shopping-list?week=${week}`)
      .then((r) => r.json())
      .then((d) => { setItems(d.ingredients ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [week])

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col" style={{ maxHeight: '80vh', border: '1px solid #f0e4e1' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f5f0ed' }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}>🛒 قائمة التسوق</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3">
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">جاري التحميل...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">لا توجد مكونات — أضف وصفات للأسبوع أولاً</div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.name}
                  onClick={() => toggle(item.name)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: checked.has(item.name) ? '#f9fafb' : 'white',
                    border: '1px solid #f0e4e1',
                    borderRight: checked.has(item.name) ? '4px solid #d1d5db' : '4px solid var(--primary-coral)',
                    opacity: checked.has(item.name) ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: checked.has(item.name) ? '#d1d5db' : 'var(--primary-coral)',
                      background: checked.has(item.name) ? '#d1d5db' : 'transparent',
                    }}
                  >
                    {checked.has(item.name) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{
                      color: '#1a1a1a',
                      textDecoration: checked.has(item.name) ? 'line-through' : 'none',
                    }}
                  >
                    {item.name}
                  </span>
                  {item.amount && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg font-medium"
                      style={{ background: 'var(--soft-coral)', color: 'var(--primary-coral)' }}
                    >
                      {item.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 text-xs text-gray-400 text-center" style={{ borderTop: '1px solid #f5f0ed' }}>
          اضغط على أي مكوّن لتحديده كـ &quot;تم شراؤه&quot;
        </div>
      </div>
    </div>
  )
}

// ─── Meal Cell ────────────────────────────────────────────────────────────────
function MealCell({
  entry,
  onAdd,
  onRemove,
  removing,
  adding,
}: {
  entry: MealPlanEntry | null
  onAdd: () => void
  onRemove: (id: string) => void
  removing: boolean
  adding: boolean
}) {
  if (adding) {
    return (
      <div className="w-full min-h-[80px] rounded-xl flex items-center justify-center" style={{ border: '2px dashed #f0e4e1', background: 'var(--soft-coral)' }}>
        <svg className="animate-spin w-5 h-5" style={{ color: 'var(--primary-coral)' }} viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!entry) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-full min-h-[80px] flex items-center justify-center rounded-xl border-2 border-dashed transition-all hover:border-[#e06b53] hover:bg-orange-50 group"
        style={{ borderColor: '#f0e4e1' }}
      >
        <span className="text-2xl text-gray-300 group-hover:text-[#e06b53] transition-colors">+</span>
      </button>
    )
  }

  return (
    <div
      className="relative w-full min-h-[80px] rounded-xl p-2.5 flex flex-col justify-between group"
      style={{ background: 'white', border: '1px solid #f0e4e1', borderRight: '3px solid var(--primary-coral)' }}
    >
      <Link href={`/recipe/${entry.recipe_id}`} className="block">
        <p
          className="text-xs font-bold leading-snug line-clamp-2 hover:text-[#c95a45] transition-colors"
          style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}
        >
          {entry.recipe?.recipe_name ?? '...'}
        </p>
      </Link>
      <button
        onClick={() => onRemove(entry.id)}
        disabled={removing}
        className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        style={{ background: '#fee2e2', color: '#b91c1c' }}
        title="حذف"
      >
        ✕
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart())
  const [entries, setEntries] = useState<MealPlanEntry[]>([])
  const [weekMeta, setWeekMeta] = useState<MealPlanWeek | null>(null)
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [addingCell, setAddingCell] = useState<string | null>(null) // "day-slot" key
  const [addTarget, setAddTarget] = useState<{ day: number; slot: MealSlot } | null>(null)
  const [sharing, setSharing] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  // silent=true skips the full loading spinner (used after add/remove)
  const loadWeek = useCallback(async (week: string, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`/api/planner?week=${week}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
      setWeekMeta(data.week ?? null)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { loadWeek(weekStart) }, [weekStart, loadWeek])

  function getEntry(day: number, slot: MealSlot): MealPlanEntry | null {
    return entries.find((e) => Number(e.day_of_week) === day && e.meal_slot === slot) ?? null
  }

  function cellKey(day: number, slot: MealSlot) { return `${day}-${slot}` }

  async function handleSelect(recipe: Recipe) {
    if (!addTarget) return
    const target = { day: addTarget.day, slot: addTarget.slot }
    setAddTarget(null)
    setAddingCell(cellKey(target.day, target.slot))
    try {
      const res = await fetch('/api/planner/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start: weekStart,
          day_of_week: target.day,
          meal_slot: target.slot,
          recipe_id: recipe.id,
        }),
      })
      const data = await res.json()
      console.log('[planner] add response:', res.status, JSON.stringify(data).slice(0, 200))
      if (!res.ok) {
        setErrorToast(data.error || 'فشل إضافة الوجبة')
        setTimeout(() => setErrorToast(null), 4000)
      }
      // Always reload from server — source of truth
      await loadWeek(weekStart, true)
    } finally {
      setAddingCell(null)
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    try {
      await fetch(`/api/planner/entry?id=${id}`, { method: 'DELETE' })
      await loadWeek(weekStart, true)
    } finally {
      setRemovingId(null)
    }
  }

  async function handleShare() {
    setSharing(true)
    const res = await fetch('/api/planner/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: weekStart }),
    })
    const data = await res.json()
    setWeekMeta((prev) => prev ? { ...prev, is_public: data.is_public, share_token: data.share_token } : {
      id: '', user_id: '', week_start: weekStart, created_at: '',
      is_public: data.is_public,
      share_token: data.share_token,
    })
    setSharing(false)
    if (data.is_public) {
      const url = `${window.location.origin}/planner/shared/${data.share_token}`
      await navigator.clipboard.writeText(url).catch(() => {})
      setShareToast('تم نسخ الرابط!')
      setTimeout(() => setShareToast(null), 3000)
    }
  }

  const weekEnd = getDayDate(weekStart, 6)
  const isPublic = weekMeta?.is_public ?? false

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}>
            📅 مخطط الوجبات الأسبوعي
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">نظّم وجباتك للأسبوع مسبقاً</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share toggle */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm disabled:opacity-60"
            style={{
              background: isPublic ? '#dcfce7' : 'white',
              color: isPublic ? '#15803d' : '#555',
              border: `1px solid ${isPublic ? '#bbf7d0' : '#f0e4e1'}`,
            }}
          >
            {sharing ? '...' : isPublic ? '🔗 مشارك — انسخ الرابط' : '🔗 مشاركة'}
          </button>

          {/* Share link copy (if already public) */}
          {isPublic && weekMeta?.share_token && (
            <button
              onClick={async () => {
                const url = `${window.location.origin}/planner/shared/${weekMeta.share_token}`
                await navigator.clipboard.writeText(url).catch(() => {})
                setShareToast('تم نسخ الرابط!')
                setTimeout(() => setShareToast(null), 3000)
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
            >
              📋 نسخ الرابط
            </button>
          )}
        </div>
      </div>

      {/* Week Navigator */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl mb-5"
        style={{ background: 'white', border: '1px solid #f0e4e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, -1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
        >
          ←
        </button>
        <div className="text-center">
          <p className="font-bold text-sm" style={{ color: '#1a1a1a' }}>
            {formatShortDate(weekStart)} — {formatShortDate(weekEnd)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">السبت → الجمعة</p>
        </div>
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
        >
          →
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate" style={{ borderSpacing: '6px', minWidth: '700px' }}>
            <thead>
              <tr>
                {/* slot label column */}
                <th className="w-16" />
                {DAYS.map((day) => (
                  <th key={day.key} className="text-center pb-1">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold" style={{ color: '#1a1a1a' }}>{day.label}</span>
                      <span className="text-xs text-gray-400">{formatShortDate(getDayDate(weekStart, day.key))}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot.key}>
                  {/* Row label */}
                  <td className="text-center align-middle">
                    <div
                      className="inline-flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
                      style={{ background: 'var(--soft-coral)' }}
                    >
                      <span className="text-base">{slot.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary-coral)' }}>{slot.label}</span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const entry = getEntry(day.key, slot.key)
                    return (
                      <td key={day.key} className="align-top" style={{ verticalAlign: 'top' }}>
                        <MealCell
                          entry={entry}
                          onAdd={() => setAddTarget({ day: day.key, slot: slot.key })}
                          onRemove={handleRemove}
                          removing={removingId === entry?.id}
                          adding={addingCell === cellKey(day.key, slot.key)}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {addTarget && (
        <AddMealModal onClose={() => setAddTarget(null)} onSelect={handleSelect} />
      )}

      {/* Toasts */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg z-50" style={{ background: '#1a1a1a', color: 'white' }}>
          {shareToast}
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg z-50" style={{ background: '#dc2626', color: 'white' }}>
          ⚠️ {errorToast}
        </div>
      )}
    </div>
  )
}

export default PlannerPage
