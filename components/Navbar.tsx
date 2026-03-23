'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

function getInitial(email: string) {
  return email.charAt(0).toUpperCase()
}

function shortEmail(email: string) {
  const [name] = email.split('@')
  return name.length > 14 ? name.slice(0, 14) + '…' : name
}

function NavbarInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const isGroceryTab = pathname === '/grocery'
  const isPlannerTab = pathname === '/planner'

  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setSigningOut(false)
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #f0e4e1', boxShadow: '0 1px 12px rgba(224,107,83,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: 'var(--primary-coral)' }}>
              🍳
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Amiri, serif', color: 'var(--primary-coral)' }}>
              Machla
            </span>
          </Link>

          {/* Desktop Nav links — center */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive('/') ? 'var(--soft-coral)' : 'transparent',
                color: isActive('/') ? 'var(--primary-coral)' : '#555',
              }}
            >
              الرئيسية
            </Link>
            <Link
              href="/planner"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isPlannerTab ? 'var(--soft-coral)' : 'transparent',
                color: isPlannerTab ? 'var(--primary-coral)' : '#555',
              }}
            >
              📅 المخطط
            </Link>
            <Link
              href="/grocery"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isGroceryTab ? 'var(--soft-coral)' : 'transparent',
                color: isGroceryTab ? 'var(--primary-coral)' : '#555',
              }}
            >
              🛒 قائمة التسوق
            </Link>
            <Link
              href="/process"
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: isActive('/process') ? 'var(--primary-coral)' : 'var(--soft-coral)',
                color: isActive('/process') ? 'white' : 'var(--primary-coral)',
              }}
            >
              + أضف وصفة
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all hover:shadow-sm"
                  style={{ border: '1.5px solid #f0e4e1', background: dropdownOpen ? 'var(--soft-coral)' : 'white' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary-coral)' }}
                  >
                    {getInitial(user.email ?? 'U')}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#444' }}>
                    {shortEmail(user.email ?? '')}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{ color: '#aaa', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-52 rounded-2xl py-1.5 z-50"
                    style={{ background: 'white', border: '1px solid #f0e4e1', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #f5f0ed' }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold text-white"
                          style={{ backgroundColor: 'var(--primary-coral)' }}
                        >
                          {getInitial(user.email ?? 'U')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{shortEmail(user.email ?? '')}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      لوحة التحكم
                    </Link>

                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-right disabled:opacity-50"
                      style={{ color: '#e06b53' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf2f0')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {signingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="coral-btn text-white font-bold px-5 py-2 rounded-xl text-sm"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 pt-2 space-y-1" style={{ borderColor: '#f0e4e1' }}>
          <Link href="/" className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: isActive('/') ? 'var(--primary-coral)' : '#555', backgroundColor: isActive('/') ? 'var(--soft-coral)' : 'transparent' }}>
            الرئيسية
          </Link>
          <Link href="/planner" className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: isPlannerTab ? 'var(--primary-coral)' : '#555', backgroundColor: isPlannerTab ? 'var(--soft-coral)' : 'transparent' }}>
            📅 المخطط الأسبوعي
          </Link>
          <Link href="/grocery" className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: isGroceryTab ? 'var(--primary-coral)' : '#555', backgroundColor: isGroceryTab ? 'var(--soft-coral)' : 'transparent' }}>
            🛒 قائمة التسوق
          </Link>
          <Link href="/process" className="block px-4 py-2.5 rounded-xl text-sm font-bold text-center" style={{ backgroundColor: 'var(--soft-coral)', color: 'var(--primary-coral)' }}>
            + أضف وصفة
          </Link>
          <div className="border-t pt-2 mt-2" style={{ borderColor: '#f0e4e1' }}>
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-4 py-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary-coral)' }}>
                    {getInitial(user.email ?? 'U')}
                  </div>
                  <span className="text-sm text-gray-600 truncate">{user.email}</span>
                </div>
                <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">لوحة التحكم</Link>
                <button onClick={handleSignOut} disabled={signingOut} className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{ color: 'var(--primary-coral)' }}>
                  {signingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="coral-btn block px-4 py-2.5 rounded-xl text-sm font-bold text-center text-white">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

import { Suspense } from 'react'
export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  )
}
