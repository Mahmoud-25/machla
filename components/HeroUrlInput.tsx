'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { detectPlatform } from '@/lib/utils'

export default function HeroUrlInput() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) { setError('الصق رابط الفيديو أولاً'); return }
    try { new URL(trimmed) } catch { setError('الرابط غير صالح'); return }
    if (!detectPlatform(trimmed)) { setError('يوتيوب أو تيك توك أو إنستغرام فقط'); return }
    setError(null)
    router.push(`/process?url=${encodeURIComponent(trimmed)}`)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) { setUrl(text); setError(null) }
    } catch { /* clipboard blocked */ }
  }

  const detected = url.trim() ? detectPlatform(url) : null

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.6)' }}>
        {/* Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder="الصق رابط الفيديو هنا..."
          className="flex-1 px-5 py-4 text-base outline-none bg-transparent text-gray-800 placeholder-gray-300"
          dir="ltr"
        />

        {/* Clear (shown when has value) */}
        {url && (
          <button
            type="button"
            onClick={() => { setUrl(''); setError(null) }}
            className="px-2 text-gray-300 hover:text-gray-500 transition-colors text-sm"
          >
            ✕
          </button>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-4 font-bold text-sm text-white transition-all hover:opacity-90 flex-shrink-0 m-1.5 rounded-xl"
          style={{ backgroundColor: 'var(--primary-coral)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          استخرج
        </button>
      </div>

      {/* Paste hint below input */}
      {!url && (
        <p className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
          انسخ الرابط ثم اضغط{' '}
          <button type="button" onClick={handlePaste} className="underline font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
            لصق
          </button>{' '}
          أو اكتبه مباشرة
        </p>
      )}

      {/* Platform detected */}
      {detected && !error && (
        <p className="mt-2 text-xs text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
          ✓ تم التعرف على{' '}
          {detected === 'youtube' ? 'يوتيوب' : detected === 'tiktok' ? 'تيك توك' : 'إنستغرام'}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-center font-medium" style={{ color: 'rgba(255,220,210,1)' }}>
          ⚠ {error}
        </p>
      )}
    </form>
  )
}
