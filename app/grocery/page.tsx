'use client'

import { useState } from 'react'
import { GroceryListTab } from '@/components/GroceryListTab'
import { getWeekStart, shiftWeek, formatShortDate } from '@/lib/utils'

function getDayDate(weekStart: string, dayIndex: number): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + dayIndex)
  return d.toISOString().split('T')[0]
}

export default function GroceryPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart())
  const weekEnd = getDayDate(weekStart, 6)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}>
          🛒 قائمة التسوق
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">مكونات وجبات الأسبوع وقائمة التسوق</p>
      </div>

      {/* Week Navigator */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl mb-6"
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

      <GroceryListTab weekStart={weekStart} />
    </div>
  )
}
