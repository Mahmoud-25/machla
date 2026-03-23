'use client'

import { useState, useEffect } from 'react'
import { detectPlatform } from '@/lib/utils'

interface VideoUrlFormProps {
  onSubmit: (url: string) => void
  loading: boolean
}

const platformIcons = {
  youtube: (
    <span className="flex items-center gap-1.5 text-red-600 font-medium text-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
      يوتيوب
    </span>
  ),
  tiktok: (
    <span className="flex items-center gap-1.5 text-stone-800 font-medium text-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
      تيك توك
    </span>
  ),
  instagram: (
    <span className="flex items-center gap-1.5 text-pink-600 font-medium text-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
      إنستغرام
    </span>
  ),
}

export default function VideoUrlForm({ onSubmit, loading }: VideoUrlFormProps) {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | null>(null)

  useEffect(() => {
    if (url.trim()) {
      setDetectedPlatform(detectPlatform(url))
      setUrlError(null)
    } else {
      setDetectedPlatform(null)
    }
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUrlError(null)

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setUrlError('يرجى إدخال رابط الفيديو')
      return
    }

    try {
      new URL(trimmedUrl)
    } catch {
      setUrlError('الرابط غير صالح. يرجى التحقق منه')
      return
    }

    if (!detectPlatform(trimmedUrl)) {
      setUrlError('الرابط غير مدعوم. يرجى استخدام رابط من يوتيوب أو تيك توك أو إنستغرام')
      return
    }

    onSubmit(trimmedUrl)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
      }
    } catch {
      // Clipboard access not allowed — ignore
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          رابط الفيديو
        </label>
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="الصق رابط الفيديو هنا..."
            disabled={loading}
            className={`w-full px-4 py-4 text-base rounded-xl border-2 focus:outline-none transition-colors bg-stone-50 placeholder-stone-300 text-stone-800 disabled:opacity-60 ${
              urlError
                ? 'border-red-300 focus:border-red-400'
                : detectedPlatform
                ? 'border-green-300 focus:border-green-400'
                : 'border-stone-200 focus:border-amber-400'
            }`}
            dir="ltr"
          />
          {/* Paste button */}
          {!url && !loading && (
            <button
              type="button"
              onClick={handlePaste}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-500 transition-colors text-xs font-medium px-2 py-1 rounded-lg hover:bg-amber-50"
            >
              لصق
            </button>
          )}
          {/* Clear button */}
          {url && !loading && (
            <button
              type="button"
              onClick={() => { setUrl(''); setUrlError(null); setDetectedPlatform(null) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Platform Detection Badge */}
        {detectedPlatform && !urlError && (
          <div className="mt-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-600 text-sm">تم التعرف على المنصة:</span>
            {platformIcons[detectedPlatform]}
          </div>
        )}

        {/* Error Message */}
        {urlError && (
          <div className="mt-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-500 text-sm">{urlError}</span>
          </div>
        )}
      </div>

      {/* Supported Platforms */}
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span>المنصات المدعومة:</span>
        <div className="flex items-center gap-2">
          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">يوتيوب</span>
          <span className="bg-stone-50 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">تيك توك</span>
          <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">إنستغرام</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-all shadow-sm hover:shadow-md"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>جاري المعالجة...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>استخرج الوصفة</span>
          </>
        )}
      </button>
    </form>
  )
}
