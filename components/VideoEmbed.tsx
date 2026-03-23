interface VideoEmbedProps {
  videoUrl: string
  platform: 'youtube' | 'tiktok' | 'instagram' | null
}

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,           // youtube.com/watch?v=ID
    /youtu\.be\/([^?&#]+)/,      // youtu.be/ID
    /youtube\.com\/shorts\/([^?&#/]+)/, // youtube.com/shorts/ID
    /youtube\.com\/embed\/([^?&#/]+)/,  // already an embed
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`
  }
  return null
}

function getTikTokEmbedUrl(url: string): string | null {
  // Extract video ID from TikTok URL: tiktok.com/@user/video/ID
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`
  return null
}

export default function VideoEmbed({ videoUrl, platform }: VideoEmbedProps) {
  if (!platform) return null

  if (platform === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(videoUrl)
    if (!embedUrl) return <VideoLink videoUrl={videoUrl} platform={platform} />

    return (
      <div className="rounded-2xl overflow-hidden shadow-sm mb-6" style={{ border: '1px solid #f0e4e1' }}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    )
  }

  if (platform === 'tiktok') {
    const embedUrl = getTikTokEmbedUrl(videoUrl)
    if (!embedUrl) return <VideoLink videoUrl={videoUrl} platform={platform} />

    return (
      <div className="rounded-2xl overflow-hidden shadow-sm mb-6 flex justify-center" style={{ border: '1px solid #f0e4e1' }}>
        <iframe
          src={embedUrl}
          title="TikTok video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          style={{ border: 'none', width: '325px', height: '740px', maxWidth: '100%' }}
        />
      </div>
    )
  }

  // Instagram — embeds require their API & JS SDK, show a styled link card instead
  return <VideoLink videoUrl={videoUrl} platform={platform} />
}

const platformMeta = {
  youtube:   { label: 'يوتيوب',   bg: '#fee2e2', color: '#b91c1c', icon: '▶' },
  tiktok:    { label: 'تيك توك',  bg: '#111827', color: '#ffffff', icon: '♪' },
  instagram: { label: 'إنستغرام', bg: '#fce7f3', color: '#9d174d', icon: '📸' },
}

function VideoLink({ videoUrl, platform }: { videoUrl: string; platform: 'youtube' | 'tiktok' | 'instagram' }) {
  const meta = platformMeta[platform]
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-2xl mb-6 transition-all hover:-translate-y-0.5"
      style={{ background: meta.bg, border: '1px solid #f0e4e1', textDecoration: 'none' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: meta.color + '22' }}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm mb-0.5" style={{ color: meta.color }}>
          شاهد الفيديو الأصلي على {meta.label}
        </p>
        <p className="text-xs truncate" style={{ color: meta.color, opacity: 0.7 }}>
          {videoUrl}
        </p>
      </div>
      <svg className="w-4 h-4 flex-shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: meta.color }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}
