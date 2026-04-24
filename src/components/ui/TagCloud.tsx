'use client'

import Link from 'next/link'
import { useMemo } from 'react'

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

function getAnimProps(index: number) {
  const seed = ((index * 2654435761) >>> 0) / 4294967296
  const seed2 = ((index * 340573321 + 1) >>> 0) / 4294967296
  const seed3 = ((index * 1013904223 + 2) >>> 0) / 4294967296

  const duration = 3 + seed * 4
  const delay = seed2 * -duration
  const floatVariant = index % 4

  return { duration, delay, floatVariant }
}

export default function TagCloud({ tags, maxCount }: TagCloudProps) {
  const sorted = useMemo(() => {
    return [...tags].sort((a, b) => b._count.articles - a._count.articles)
  }, [tags])

  return (
    <div className="tag-cloud-float">
      {sorted.map((tag, i) => {
        const ratio = maxCount > 0 ? tag._count.articles / maxCount : 0
        const size = ratio > 0.7 ? 'text-2xl md:text-3xl' : ratio > 0.4 ? 'text-xl md:text-2xl' : ratio > 0.2 ? 'text-base md:text-lg' : 'text-sm'
        const weight = ratio > 0.4 ? 'font-medium' : 'font-normal'
        const opacity = 0.6 + ratio * 0.4
        const color = PALETTE[i % PALETTE.length]
        const anim = getAnimProps(i)

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={`
              tag-cloud-item inline-flex items-baseline gap-1
              rounded-[var(--radius-sm)] px-1.5 py-0.5
              ${size} ${weight} ${color}
              hover:bg-bg-card dark:hover:bg-dark-bg-card
              hover:opacity-100 hover:scale-110
              transition-all duration-200
            `}
            style={{
              opacity,
              animation: `tag-float-${anim.floatVariant} ${anim.duration}s ease-in-out ${anim.delay}s infinite`,
            }}
          >
            <span className="min-w-0 break-words">{tag.name}</span>
            <span className="shrink-0 text-[0.65em] opacity-50 ml-0.5">{tag._count.articles}</span>
          </Link>
        )
      })}

      <style>{`
        @keyframes tag-float-0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(4px, -3px); }
          50% { transform: translate(-2px, -5px); }
          75% { transform: translate(-4px, 2px); }
        }
        @keyframes tag-float-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, -4px); }
          50% { transform: translate(5px, -2px); }
          75% { transform: translate(2px, 4px); }
        }
        @keyframes tag-float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, 4px); }
          50% { transform: translate(-4px, -3px); }
          75% { transform: translate(-2px, -5px); }
        }
        @keyframes tag-float-3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, 2px); }
          50% { transform: translate(2px, 5px); }
          75% { transform: translate(4px, -2px); }
        }
      `}</style>
    </div>
  )
}
