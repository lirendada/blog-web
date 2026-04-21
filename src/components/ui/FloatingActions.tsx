'use client'

import { useEffect, useState, useCallback } from 'react'

export default function FloatingActions() {
  const [isDark, setIsDark] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    const cookieDark = document.cookie
      .split('; ')
      .find((row) => row.startsWith('darkMode='))
      ?.split('=')[1]
    const dark = stored === 'true' || cookieDark === 'true'
    setIsDark(dark)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('darkMode', String(next))
    document.cookie = `darkMode=${next};path=/;max-age=31536000;SameSite=Lax`
  }, [isDark])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
            w-11 h-11 rounded-full flex items-center justify-center
            bg-bg-card dark:bg-dark-bg-card
            border border-border-light dark:border-dark-border-light
            shadow-md hover:shadow-lg
            text-text-secondary dark:text-dark-text-secondary
            hover:text-accent dark:hover:text-dark-accent
            transition-all duration-200 cursor-pointer
            animate-in fade-in slide-in-from-bottom-2
          "
          aria-label="回到顶部"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      <button
        onClick={toggleTheme}
        className="
          w-11 h-11 rounded-full flex items-center justify-center
          bg-bg-card dark:bg-dark-bg-card
          border border-border-light dark:border-dark-border-light
          shadow-md hover:shadow-lg
          text-text-secondary dark:text-dark-text-secondary
          hover:text-accent dark:hover:text-dark-accent
          transition-all duration-200 cursor-pointer
        "
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </div>
  )
}
