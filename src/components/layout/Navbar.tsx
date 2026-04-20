'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DarkModeToggle from '@/components/ui/DarkModeToggle'
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
            font-mono text-base text-navy dark:text-dark-text
            hover:text-accent dark:hover:text-dark-accent
            transition-colors
          "
        >
          &#x25C7; my_blog
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="
              text-text-secondary dark:text-dark-text-secondary
              hover:text-accent dark:hover:text-dark-accent
              transition-colors cursor-pointer
            "
            title="搜索 (⌘K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {navLinks.map((link) => {
            const isActive =
              link.href === '/articles'
                ? pathname.startsWith('/articles')
                : pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative font-body text-sm
                  transition-colors
                  hover:text-accent dark:hover:text-dark-accent
                  ${
                    isActive
                      ? 'text-accent dark:text-dark-accent'
                      : 'text-text-secondary dark:text-dark-text-secondary'
                  }
                  after:absolute after:bottom-[-2px] after:left-0 after:w-0
                  after:h-[1px] after:bg-accent dark:after:bg-dark-accent
                  after:transition-all after:duration-200
                  hover:after:w-full
                `}
              >
                {link.label}
              </Link>
            )
          })}

          <div className="ml-2 border-l border-dashed border-border-light dark:border-dark-border-light pl-4">
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
