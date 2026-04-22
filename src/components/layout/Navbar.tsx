'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchDialog from '@/components/ui/SearchDialog'

const navLinks = [
  { href: '/articles', label: '博客' },
  { href: '/news', label: '资讯' },
  { href: '/about', label: '关于' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    let original = document.title
    const handler = () => {
      if (document.hidden) {
        original = document.title
        document.title = 'oi，干嘛去了～'
      } else {
        document.title = original
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  return (
    <>
      <nav
        className="
          h-14 flex items-center justify-between px-6
          bg-bg dark:bg-dark-bg
          border-b border-dashed border-border-light dark:border-dark-border-light
        "
      >
        {/* Logo */}
        <Link
          href="/"
          className="
            flex items-center gap-2
            font-mono text-base text-navy dark:text-dark-text
            hover:text-accent dark:hover:text-dark-accent
            transition-colors
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width="24" height="24" className="rounded-sm" />
          <span className="translate-y-[1px]">lirendada的小屋</span>
        </Link>

        {/* Navigation links */}
        <div
          className="
            flex items-center gap-1.5
            rounded-[var(--radius-lg)]
            border border-dashed border-border-light/80 dark:border-dark-border-light/80
            bg-bg-card/70 dark:bg-dark-bg-card/40
            px-1.5 py-1
          "
        >
          <button
            onClick={() => setSearchOpen(true)}
            className="
              inline-flex h-9 w-9 items-center justify-center
              rounded-[var(--radius-sm)] border border-transparent
              text-text-secondary dark:text-dark-text-secondary
              hover:-translate-y-px
              hover:border-border-light dark:hover:border-dark-border-light
              hover:bg-bg-secondary/75 dark:hover:bg-dark-bg-secondary/75
              hover:text-accent dark:hover:text-dark-accent
              focus-visible:outline-none
              focus-visible:border-accent/40 dark:focus-visible:border-dark-accent/40
              focus-visible:bg-accent-light/70 dark:focus-visible:bg-dark-accent-light/60
              focus-visible:text-accent dark:focus-visible:text-dark-accent
              transition-all duration-200 cursor-pointer
            "
            aria-label="搜索"
            title="搜索 (⌘K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/articles' && pathname.startsWith('/articles') && !pathname.startsWith('/articles/tag'))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  inline-flex h-9 items-center rounded-[var(--radius-sm)]
                  border px-3.5
                  font-body text-sm
                  transition-all duration-200
                  hover:-translate-y-px
                  focus-visible:outline-none
                  ${
                    isActive
                      ? 'border-accent/20 dark:border-dark-accent/25 bg-accent-light/90 dark:bg-dark-accent-light/85 text-accent dark:text-dark-accent shadow-sm'
                      : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:border-border-light dark:hover:border-dark-border-light hover:bg-bg-secondary/75 dark:hover:bg-dark-bg-secondary/75 hover:text-text dark:hover:text-dark-text focus-visible:border-accent/40 dark:focus-visible:border-dark-accent/40 focus-visible:bg-accent-light/70 dark:focus-visible:bg-dark-accent-light/60 focus-visible:text-accent dark:focus-visible:text-dark-accent'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
