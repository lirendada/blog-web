'use client'

import { useState, useCallback, useMemo } from 'react'
import StickerCard from '@/components/ui/StickerCard'

interface ArticleTag {
  name: string
  slug: string
}

interface HotArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: ArticleTag[]
}

interface HotArticlesCarouselProps {
  title: string
  articles: HotArticle[]
}

const TILTS = [-3, 2, -1, 3, -2, 1, -3, 2]
const HOVER_TILTS = [1, -2, 2, -1, 1, -2, 1, -1]

function fixedTilts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    tilt: TILTS[i % TILTS.length],
    hoverTilt: HOVER_TILTS[i % HOVER_TILTS.length],
  }))
}

function randomTilts(count: number) {
  return Array.from({ length: count }, () => ({
    tilt: TILTS[Math.floor(Math.random() * TILTS.length)],
    hoverTilt: HOVER_TILTS[Math.floor(Math.random() * HOVER_TILTS.length)],
  }))
}

export default function HotArticlesCarousel({ title, articles: initial }: HotArticlesCarouselProps) {
  const [articles, setArticles] = useState(initial)
  const [tilts, setTilts] = useState(() => fixedTilts(initial.length))
  const [visible, setVisible] = useState(true)
  const [spinning, setSpinning] = useState(false)

  const refresh = useCallback(async () => {
    if (!visible) return
    setVisible(false)
    setSpinning(true)

    setTimeout(async () => {
      try {
        const ids = articles.map((a) => a.id).join(',')
        const res = await fetch(`/api/articles/random?count=6&exclude=${ids}`)
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setArticles(data)
            setTilts(randomTilts(data.length))
          }
        }
      } catch {}

      setVisible(true)
      setTimeout(() => setSpinning(false), 300)
    }, 300)
  }, [articles, visible])

  if (initial.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="home-carousel-title">{title}</h2>
        </div>
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary">
          暂无文章
        </p>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="home-carousel-title">{title}</h2>
        <button
          onClick={refresh}
          className="
            relative h-8 px-4
            flex items-center justify-center gap-2
            font-mono text-xs
            bg-bg-card dark:bg-dark-bg-card
            border-2 border-text/20 dark:border-dark-text/20
            rounded-lg
            text-text-secondary dark:text-dark-text-secondary
            hover:border-accent dark:hover:border-dark-accent
            hover:text-accent dark:hover:text-dark-accent
            active:translate-y-[2px] active:shadow-none
            shadow-[2px_2px_0_0] shadow-text/10 dark:shadow-dark-text/10
            transition-all duration-200 cursor-pointer
          "
        >
          <svg
            className={`w-3.5 h-3.5 fill-current transition-transform duration-500 ${spinning ? '-rotate-[360deg]' : ''}`}
            viewBox="0 0 48 48"
          >
            <path d="M35.3 12.7c-2.89-2.9-6.88-4.7-11.3-4.7-8.84 0-15.98 7.16-15.98 16s7.14 16 15.98 16c7.45 0 13.69-5.1 15.46-12h-4.16c-1.65 4.66-6.07 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.31 0 6.28 1.38 8.45 3.55l-6.45 6.45h14v-14l-4.7 4.7z" />
          </svg>
          <span>换一批</span>
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2 transition-[opacity,transform] duration-300 ease-in-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {articles.map((article, i) => (
          <StickerCard
            key={article.id}
            href={`/articles/${article.slug}`}
            title={article.title}
            tilt={tilts[i]?.tilt}
            hoverTilt={tilts[i]?.hoverTilt}
            excerpt={article.excerpt}
            tags={article.tags}
            pinned={i === 0 || i === 3}
          />
        ))}
      </div>
    </>
  )
}
