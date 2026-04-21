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

function getAnimProps(index: number, total: number) {
  // Pseudo-random but deterministic per index
  const seed = ((index * 2654435761) >>> 0) / 4294967296
  const seed2 = ((index * 340573321 + 1) >>> 0) / 4294967296
  const seed3 = ((index * 1013904223 + 2) >>> 0) / 4294967296

  const duration = 3 + seed * 4       // 3-7s
  const delay = seed2 * -duration      // stagger start
  const xRange = 3 + seed3 * 5         // 3-8px drift
  const yRange = 2 + seed * 4          // 2-6px drift

  const yoyo = seed2 > 0.5

  return { duration, delay, xRange, yRange, yoyo }
}

export default function TagCloud({ tags, maxCount }: TagCloudProps) {
  const sorted = useMemo(() => {
    return [...tags].sort((a, b) => b._count.articles - a._count.articles)
  }, [tags])

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center items-end py-4">
      {sorted.map((tag, i) => {
        const ratio = maxCount > 0 ? tag._count.articles / maxCount : 0
        const size = ratio > 0.7 ? 'text-3xl' : ratio > 0.4 ? 'text-xl' : ratio > 0.2 ? 'text-base' : 'text-sm'
        const weight = ratio > 0.4 ? 'font-medium' : 'font-normal'
        const opacity = 0.6 + ratio * 0.4
        const color = PALETTE[i % PALETTE.length]
        const anim = getAnimProps(i, sorted.length)

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={`
              inline-block whitespace-nowrap
              ${size} ${weight} ${color}
              hover:scale-110 hover:opacity-100
              transition-transform duration-200
            `}
            style={{
              opacity,
              animation: `float-${i % 4} ${anim.duration}s ease-in-out ${anim.delay}s infinite`,
            }}
          >
            {tag.name}
            <span className="text-[0.65em] opacity-50 ml-0.5">{tag._count.articles}</span>
          </Link>
        )
      })}

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(4px, -3px); }
          50% { transform: translate(-2px, -5px); }
          75% { transform: translate(-4px, 2px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, -4px); }
          50% { transform: translate(5px, -2px); }
          75% { transform: translate(2px, 4px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, 4px); }
          50% { transform: translate(-4px, -3px); }
          75% { transform: translate(-2px, -5px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, 2px); }
          50% { transform: translate(2px, 5px); }
          75% { transform: translate(4px, -2px); }
        }
      `}</style>
    </div>
  )
}
