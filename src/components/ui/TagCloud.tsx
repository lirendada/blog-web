'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import type { CSSProperties } from 'react'

interface Tag {
  id: string
  name: string
  slug: string
  _count: { articles: number }
}

interface TagCloudProps {
  tags: Tag[]
  maxCount: number
}

const PALETTE = [
  'text-accent dark:text-dark-accent',
  'text-rose dark:text-dark-rose',
  'text-navy dark:text-dark-text',
  'text-mustard dark:text-dark-accent',
  'text-accent-hover dark:text-dark-accent-hover',
]

export default function TagCloud({ tags, maxCount }: TagCloudProps) {
  const sorted = useMemo(() => {
    return [...tags].sort((a, b) => b._count.articles - a._count.articles)
  }, [tags])

  return (
    <div className="tag-cloud">
      {sorted.map((tag, i) => {
        const ratio = maxCount > 0 ? tag._count.articles / maxCount : 0
        const size = ratio > 0.7 ? 'text-2xl md:text-3xl' : ratio > 0.4 ? 'text-xl md:text-2xl' : ratio > 0.2 ? 'text-base md:text-lg' : 'text-sm'
        const weight = ratio > 0.4 ? 'font-medium' : 'font-normal'
        const opacity = 0.6 + ratio * 0.4
        const color = PALETTE[i % PALETTE.length]

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={`
              topic-tag inline-flex max-w-full items-baseline gap-1
              rounded-[var(--radius-sm)] px-1.5 py-0.5
              ${size} ${weight} ${color}
              hover:bg-bg-card dark:hover:bg-dark-bg-card
              hover:opacity-100 hover:-translate-y-0.5
              transition-all duration-200
            `}
            style={{
              opacity,
              '--tag-opacity': opacity,
              '--topic-delay': `${i * 28}ms`,
            } as CSSProperties}
          >
            <span className="min-w-0 break-words">{tag.name}</span>
            <span className="shrink-0 text-[0.65em] opacity-50 ml-0.5">{tag._count.articles}</span>
          </Link>
        )
      })}
    </div>
  )
}
