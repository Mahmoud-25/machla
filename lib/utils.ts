export function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return null
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Returns the ISO date string (YYYY-MM-DD) for the Saturday of the week containing `date` */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay() // 0=Sun ... 6=Sat
  d.setDate(d.getDate() - ((jsDay + 1) % 7))
  return d.toISOString().split('T')[0]
}

/** Advance a week_start string by `n` weeks (negative = go back) */
export function shiftWeek(weekStart: string, n: number): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + n * 7)
  return d.toISOString().split('T')[0]
}

/** Format a date string as short Arabic date e.g. "22 مار" */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

/** Parse ingredient lines out of a formatted_message string */
export function parseIngredientsFromMessage(formattedMessage: string): Array<{ name: string; amount: string | null }> {
  const results: Array<{ name: string; amount: string | null }> = []
  const blocks = formattedMessage.split('\n\n').filter((b) => b.trim())
  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim())
    if (!lines[0]?.includes('🛒')) continue
    lines.slice(1).forEach((line) => {
      const raw = line.replace(/^•\s*/, '').trim()
      if (!raw) return
      const colonIdx = raw.lastIndexOf(':')
      if (colonIdx === -1) { results.push({ name: raw, amount: null }); return }
      const name = raw.slice(0, colonIdx).trim()
      const amount = raw.slice(colonIdx + 1).trim()
      if (amount.startsWith('حسب الرغبة')) { results.push({ name, amount: null }); return }
      results.push({ name, amount: amount || null })
    })
  }
  return results
}
