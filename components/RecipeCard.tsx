'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
  isSaved?: boolean
}

const platformConfig = {
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

export default function RecipeCard({ recipe, isSaved: initialSaved = false }: RecipeCardProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [savingToggle, setSavingToggle] = useState(false)

  const platform = recipe.platform ? platformConfig[recipe.platform] : null

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (savingToggle) return
    setSavingToggle(true)
    try {
      const res = await fetch('/api/toggle-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
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
    <Link href={`/recipe/${recipe.id}`} className="block recipe-card group">
      <div
        className="bg-white rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
        style={{ border: '1px solid #f0e4e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        {/* Coral accent bar */}
        <div className="h-1 w-full" style={{ background: 'var(--primary-coral)' }} />

        {/* Top row: platform badge + save button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {platform ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: platform.bg, color: platform.color }}
            >
              {platform.icon}
              {platform.label}
            </span>
          ) : (
            <span />
          )}

          <button
            onClick={handleToggleSave}
            disabled={savingToggle}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: saved ? '#fce7f3' : '#f5f5f4',
              color: saved ? '#e06b53' : '#a8a29e',
            }}
            title={saved ? 'إلغاء الحفظ' : 'حفظ الوصفة'}
          >
            {savingToggle ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Recipe name */}
        <div className="px-5 pb-3">
          <h3
            className="text-xl font-bold leading-snug line-clamp-2 group-hover:text-[#c95a45] transition-colors"
            style={{ fontFamily: 'Amiri, serif', color: '#1a1a1a' }}
          >
            {recipe.recipe_name}
          </h3>
        </div>

        {/* Summary */}
        <div className="px-5 flex-1">
          {recipe.video_summary ? (
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>
              {recipe.video_summary}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: '#d1d5db' }}>لا يوجد ملخص</p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 mt-4"
          style={{ borderTop: '1px solid #f5f0ed' }}
        >
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            {formatDate(recipe.created_at)}
          </span>
          <span
            className="text-xs font-semibold flex items-center gap-1 transition-colors group-hover:underline"
            style={{ color: 'var(--primary-coral)' }}
          >
            عرض الوصفة
            <svg className="w-3 h-3 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
