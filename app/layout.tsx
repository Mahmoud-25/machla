import type { Metadata } from 'next'
import { Amiri, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Machla | حوّل فيديوهاتك إلى وصفات',
  description: 'حوّل أي فيديو طبخ من يوتيوب أو تيك توك أو إنستغرام إلى وصفة مكتوبة بلحظات',
  keywords: ['وصفات', 'فيديو', 'طبخ', 'يوتيوب', 'تيك توك', 'إنستغرام', 'Machla'],
  openGraph: {
    title: 'Machla',
    description: 'حوّل أي فيديو طبخ إلى وصفة مكتوبة',
    locale: 'ar_SA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${notoSansArabic.variable}`}>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-beige)' }} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
        <footer className="bg-white border-t py-8 mt-16" style={{ borderColor: '#f0e4e1' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Machla — حوّل فيديوهاتك إلى وصفات
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
