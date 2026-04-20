import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '资讯',
  description: 'AI 与科技资讯聚合。',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string; source?: string }>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const sourceId = params.source || undefined

  const where = { ...(sourceId ? { sourceId } : {}) }

  const [items, total, sources] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsItem.count({ where }),
    prisma.newsSource.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-[960px] w-full mx-auto px-6">
      <h1
        className="font-heading text-3xl text-text dark:text-dark-text pt-10 pb-6"
      >
        资讯
      </h1>

      {/* 来源筛选 */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-6">
          <a
            href="/news"
            className={`
              inline-block rounded-[var(--radius-sm)] px-3 py-1
              font-mono text-xs transition-colors
              ${!sourceId
                ? 'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent'
                : 'bg-bg-secondary text-text-secondary dark:bg-dark-bg-secondary dark:text-dark-text-secondary hover:text-accent dark:hover:text-dark-accent'
              }
            `}
          >
            全部
          </a>
          {sources.map((source) => (
            <a
              key={source.id}
              href={`/news?source=${source.id}`}
              className={`
                inline-block rounded-[var(--radius-sm)] px-3 py-1
                font-mono text-xs transition-colors
                ${sourceId === source.id
                  ? 'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent'
                  : 'bg-bg-secondary text-text-secondary dark:bg-dark-bg-secondary dark:text-dark-text-secondary hover:text-accent dark:hover:text-dark-accent'
                }
              `}
            >
              {source.name}
            </a>
          ))}
        </div>
      )}

      <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-8" />

      {/* 资讯列表 */}
      {items.length > 0 ? (
        <div className="flex flex-col gap-4 pb-8">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group block p-4
                border border-dashed border-border-light dark:border-dark-border-light
                rounded-[var(--radius-md)]
                hover:border-accent dark:hover:border-dark-accent
                transition-all duration-200 ease-out
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              <h3
                className="
                  font-heading text-lg
                  text-text dark:text-dark-text
                  group-hover:text-accent dark:group-hover:text-dark-accent
                  transition-colors
                  line-clamp-2
                  mb-2
                "
              >
                {item.title}
              </h3>
              <div
                className="
                  font-mono text-xs
                  text-text-secondary dark:text-dark-text-secondary
                  flex items-center gap-3
                "
              >
                {item.sourceName && (
                  <span className="inline-block bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent px-2 py-0.5 rounded-[var(--radius-full)]">
                    {item.sourceName}
                  </span>
                )}
                {item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}
                <span className="ml-auto text-accent dark:text-dark-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  阅读原文 →
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm text-center py-16 text-text-secondary dark:text-dark-text-secondary">
          暂无资讯
        </p>
      )}

      {totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={page} basePath="/news" />
      )}
    </div>
  )
}
