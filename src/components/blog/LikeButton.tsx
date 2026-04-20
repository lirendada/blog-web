'use client'

import { useState, useEffect } from 'react'

interface LikeButtonProps {
  slug: string
  initialCount: number
}

export default function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check cookie on client to know initial liked state
    const cookies = document.cookie.split('; ')
    const hasLiked = cookies.some((c) => c.startsWith(`liked_${slug}=`))
    setLiked(hasLiked)
  }, [slug])

  const handleLike = async () => {
    if (liked || loading) return
    setLoading(true)

    // Optimistic UI update
    setCount((c) => c + 1)
    setLiked(true)

    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: 'POST' })
      if (!res.ok) {
        // Revert on failure
        setCount((c) => c - 1)
        setLiked(false)
        const data = await res.json().catch(() => ({}))
        if (res.status === 409) {
          // Already liked via another tab/device, keep state but update cookie
          setLiked(true)
        }
      }
    } catch {
      // Network error, revert
      setCount((c) => c - 1)
      setLiked(false)
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration mismatch: render server state first, update after mount
  const displayCount = mounted ? count : initialCount
  const displayLiked = mounted ? liked : false

  return (
    <div className="flex items-center justify-center py-8">
      <button
        onClick={handleLike}
        disabled={displayLiked || loading}
        className={`
          group flex items-center gap-2 px-5 py-2.5
          border border-dashed rounded-[var(--radius-md)]
          font-mono text-sm transition-all duration-200 cursor-pointer
          ${
            displayLiked
              ? 'border-accent dark:border-dark-accent bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent cursor-default'
              : 'border-border-light dark:border-dark-border-light text-text-secondary dark:text-dark-text-secondary hover:border-accent dark:hover:border-dark-accent hover:text-accent dark:hover:text-dark-accent'
          }
          disabled:opacity-80
        `}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${!displayLiked ? 'group-hover:scale-125' : ''}`}
          fill={displayLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>{displayLiked ? '已赞' : '点赞'}</span>
        <span className="text-xs opacity-70">{displayCount}</span>
      </button>
    </div>
  )
}
