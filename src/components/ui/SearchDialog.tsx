'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type SearchResult = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.articles || [])
    } catch { setResults([]) }
    finally { setLoading(false) }
    setActiveIndex(-1)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (slug: string) => {
    onClose()
    router.push(`/articles/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      handleSelect(results[activeIndex].slug)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-[560px] px-4">
        <div
          className="
            bg-bg-card dark:bg-dark-bg-card
            border border-dashed border-border-light dark:border-dark-border-light
            rounded-[var(--radius-lg)]
            shadow-lg overflow-hidden
          "
        >
          {/* Input */}
          <div className="flex items-center px-4 border-b border-dashed border-border-light dark:border-dark-border-light">
            <svg className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章..."
              className="
                flex-1 bg-transparent border-0 focus:outline-none
                font-mono text-sm py-3.5 px-3
                text-text dark:text-dark-text
                placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary
              "
            />
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-text-secondary dark:text-dark-text-secondary border border-dashed border-border-light dark:border-dark-border-light rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="py-8 text-center font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                搜索中...
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="py-8 text-center font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                未找到相关文章
              </div>
            )}

            {!loading && results.map((article, i) => (
              <button
                key={article.id}
                onClick={() => handleSelect(article.slug)}
                className={`
                  w-full text-left px-4 py-3 transition-colors cursor-pointer
                  ${i === activeIndex
                    ? 'bg-accent-light/50 dark:bg-dark-accent-light/50'
                    : 'hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'
                  }
                  ${i < results.length - 1 ? 'border-b border-dashed border-border-light dark:border-dark-border-light' : ''}
                `}
              >
                <div className="font-heading text-sm text-text dark:text-dark-text line-clamp-1">
                  {article.title}
                </div>
                {article.excerpt && (
                  <div className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-1">
                    {article.excerpt}
                  </div>
                )}
              </button>
            ))}

            {!loading && query.length < 2 && (
              <div className="py-8 text-center font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                输入至少 2 个字符开始搜索
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
