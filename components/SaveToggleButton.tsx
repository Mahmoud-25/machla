'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SaveToggleButtonProps {
  recipeId: string
  initialSaved: boolean
}

export default function SaveToggleButton({ recipeId, initialSaved }: SaveToggleButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/toggle-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })

      if (res.status === 401) {
        router.push('/auth/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
        router.refresh()
      }
    } catch (err) {
      console.error('toggle save error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
        saved
          ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
          : 'bg-white text-amber-600 hover:bg-amber-50 border border-white/50'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      title={saved ? 'إلغاء الحفظ' : 'حفظ الوصفة'}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      <span>{saved ? 'محفوظة' : 'حفظ'}</span>
    </button>
  )
}
