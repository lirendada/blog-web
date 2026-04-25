'use client'

import { useEffect, useMemo, useState } from 'react'

export type RankingItem = {
  id: string
  title: string
  url: string
  hot?: string
}

export type RankingBoard = {
  key: string
  title: string
  meta: string
  href?: string
  items: RankingItem[]
  featured?: boolean
  loading?: boolean
  error?: boolean
}

export type ExternalRankingSource = {
  key: string
  title: string
  meta: string
  href: string
}

type HomeRankingBoardsProps = {
  aiRanking: RankingBoard | null
  sources: ExternalRankingSource[]
  limit: number
}

type HotRankingsResponse = {
  boards?: RankingBoard[]
}

export default function HomeRankingBoards({
  aiRanking,
  sources,
  limit,
}: HomeRankingBoardsProps) {
  const initialBoards = useMemo(
    () => [
      ...(aiRanking ? [aiRanking] : []),
      ...sources.map((source) => ({
        ...source,
        items: [],
        loading: true,
      })),
    ],
    [aiRanking, sources],
  )
  const [boards, setBoards] = useState<RankingBoard[]>(initialBoards)

  useEffect(() => {
    let cancelled = false

    async function loadRankings() {
      let externalBoards: RankingBoard[] = []

      try {
        const res = await fetch(`/api/hot-rankings?limit=${limit}`, {
          headers: { Accept: 'application/json' },
        })

        if (res.ok) {
          const payload = (await res.json()) as HotRankingsResponse
          externalBoards = payload.boards || []
        }
      } catch {}

      if (!cancelled) {
        const boardMap = new Map(externalBoards.map((board) => [board.key, board]))
        setBoards([
          ...(aiRanking ? [aiRanking] : []),
          ...sources.map((source) => {
            const loaded = boardMap.get(source.key)
            return loaded || {
              ...source,
              items: [],
              error: true,
            }
          }),
        ])
      }
    }

    loadRankings()

    return () => {
      cancelled = true
    }
  }, [aiRanking, limit, sources])

  if (boards.length === 0) return null

  return (
    <div className="home-ranking-grid">
      {boards.map((board) => (
        <section
          key={board.key}
          className={`home-ranking-card ${board.featured ? 'home-ranking-card-featured' : ''}`}
          aria-labelledby={`home-ranking-${board.key}`}
        >
          <div className="home-ranking-card-head">
            <div>
              <p className="home-ranking-meta">{board.meta}</p>
              <h3 id={`home-ranking-${board.key}`} className="home-ranking-title">
                {board.title}
              </h3>
            </div>
            {board.href && (
              <a
                href={board.href}
                target={board.href.startsWith('/') ? undefined : '_blank'}
                rel={board.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="home-ranking-more"
              >
                更多
              </a>
            )}
          </div>

          {board.items.length > 0 ? (
            <ol className="home-ranking-list">
              {board.items.map((item, index) => (
                <li key={item.id} className="home-ranking-item">
                  <span className="home-ranking-index">{String(index + 1).padStart(2, '0')}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-ranking-link"
                  >
                    {item.title}
                  </a>
                  {item.hot && <span className="home-ranking-hot">{item.hot}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <div className="home-ranking-state">
              {board.loading ? '正在取榜单...' : '暂时没有拉到热榜，点“更多”看源站。'}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
