'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchDialog from '@/components/ui/SearchDialog'

type NavIconProps = {
  className?: string
}

function BlogIcon({ className = 'w-4 h-4' }: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.75 6.75c0-1.1.9-2 2-2h4.5c.8 0 1.57.22 2.25.63.68-.4 1.45-.63 2.25-.63h1.5c1.1 0 2 .9 2 2v10.5c0 .69-.56 1.25-1.25 1.25h-2.25c-.82 0-1.62.2-2.33.58l-.92.49-.92-.49a4.95 4.95 0 0 0-2.33-.58H6c-.69 0-1.25-.56-1.25-1.25V6.75Z" />
      <path d="M13.5 5.38V18.5" />
      <path d="M8 9h2.5" />
      <path d="M16 9h1.5" />
    </svg>
  )
}

function NewsIcon({ className = 'w-4 h-4' }: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5.25 6.25h10.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H8.25a3 3 0 0 1-3-3V7.25a1 1 0 0 1 1-1Z" />
      <path d="M17.75 9.25h1a1 1 0 0 1 1 1v5.5a3 3 0 0 1-3 3" />
      <path d="M8.5 9.5h6" />
      <path d="M8.5 12.5h6" />
      <path d="M8.5 15.5h3.5" />
    </svg>
  )
}

function AboutIcon({ className = 'w-4 h-4' }: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 10.25v4.25" />
      <path d="M12 7.75h.01" />
    </svg>
  )
}

const navLinks = [
  { href: '/articles', label: '博客', Icon: BlogIcon },
  { href: '/news', label: '资讯', Icon: NewsIcon },
  { href: '/about', label: '关于', Icon: AboutIcon },
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
          site-nav
          min-h-14 flex flex-wrap items-center justify-between px-4 py-2
          sm:h-14 sm:flex-nowrap sm:px-6 sm:py-0
          bg-bg dark:bg-dark-bg
          border-b border-dashed border-border-light dark:border-dark-border-light
        "
      >
        {/* Logo */}
        <Link
          href="/"
          className="
            flex shrink-0 items-center gap-2
            font-mono text-base text-navy dark:text-dark-text
            transition-colors
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width="24" height="24" className="rounded-sm" />
          <span className="hidden sm:inline translate-y-[1px]">lirendada的小屋</span>
        </Link>

        {/* Navigation links */}
        <div
          className="
            site-nav-actions
            order-3 mt-1 flex w-full shrink-0 items-center justify-center gap-0.5
            sm:order-none sm:mt-0 sm:w-auto sm:justify-end sm:gap-1.5
            rounded-[var(--radius-lg)]
            px-1.5 py-1
          "
        >
          <button
            onClick={() => setSearchOpen(true)}
            className="
              inline-flex h-9 w-8 sm:w-9 items-center justify-center
              rounded-[var(--radius-sm)] border border-transparent
              text-text-secondary dark:text-dark-text-secondary
              hover:-translate-y-[2px]
              hover:border-border dark:hover:border-dark-border
              hover:text-accent dark:hover:text-dark-accent
              hover:shadow-[0_8px_18px_rgba(74,69,64,0.10)]
              dark:hover:shadow-[0_8px_18px_rgba(0,0,0,0.24)]
              focus-visible:outline-none
              focus-visible:border-accent/40 dark:focus-visible:border-dark-accent/40
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
            const Icon = link.Icon

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className={`
                  group relative inline-flex h-9 w-8 items-center justify-center gap-2 rounded-[var(--radius-sm)]
                  border px-0 sm:w-auto sm:px-3.5
                  font-body text-sm
                  transition-all duration-200
                  hover:-translate-y-[2px]
                  focus-visible:outline-none
                  ${
                    isActive
                      ? 'border-accent/20 dark:border-dark-accent/25 text-accent dark:text-dark-accent shadow-[0_3px_10px_rgba(125,144,112,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.22)]'
                      : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:border-border dark:hover:border-dark-border hover:text-text dark:hover:text-dark-text hover:shadow-[0_8px_18px_rgba(74,69,64,0.10)] dark:hover:shadow-[0_8px_18px_rgba(0,0,0,0.24)] focus-visible:border-accent/40 dark:focus-visible:border-dark-accent/40 focus-visible:text-accent dark:focus-visible:text-dark-accent'
                  }
                `}
              >
                <Icon
                  className={`
                    h-[15px] w-[15px] shrink-0 transition-all duration-200
                    ${isActive ? 'opacity-100' : 'opacity-75 group-hover:opacity-100 group-hover:text-accent dark:group-hover:text-dark-accent'}
                  `}
                />
                <span className="hidden sm:inline whitespace-nowrap">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
