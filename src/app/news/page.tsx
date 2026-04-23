import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDateHeader, getDateKey } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'

export const metadata: Metadata = {
  title: '资讯',
  description: 'AI 与科技资讯聚合。',
}

export const revalidate = 900

const PAGE_SIZE = 20

function formatTimeLabel(date: Date | null) {
  if (!date) return null

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

interface PageProps {
  searchParams: Promise<{ page?: string; source?: string }>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const sourceId = params.source || undefined

  const where = { ...(sourceId ? { sourceId } : {}) }

  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        source: { select: { name: true } },
      },
    }),
    prisma.newsItem.count({ where }),
  ])

  // Group items by date
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = getDateKey(item.publishedAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-[960px] w-full mx-auto px-6">
      <h1 className="font-heading text-3xl text-text dark:text-dark-text pt-10 pb-6">
        资讯
      </h1>

      {/* 按日期分组的资讯列表 */}
      {items.length > 0 ? (
        <div className="flex flex-col gap-6 pb-8">
          {Object.entries(grouped).map(([dateKey, groupItems]) => (
            <div key={dateKey}>
              <h2 className="font-mono text-[13px] text-text-secondary dark:text-dark-text-secondary mb-3 pb-1.5 border-b border-dashed border-border-light dark:border-dark-border-light">
                {groupItems[0].publishedAt
                  ? formatDateHeader(groupItems[0].publishedAt)
                  : '未知日期'}
              </h2>
              <div className="flex flex-col gap-2">
                {groupItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group block px-3 py-3
                      border border-dashed border-border-light dark:border-dark-border-light
                      rounded-[var(--radius-md)]
                      bg-bg-card/55 dark:bg-dark-bg-card/35
                      hover:border-accent/55 dark:hover:border-dark-accent/55
                      hover:bg-bg-card dark:hover:bg-dark-bg-card/55
                      transition-colors duration-200 ease-out
                    "
                  >
                    <h3
                      className="
                        font-heading text-base sm:text-[17px] leading-snug
                        text-text dark:text-dark-text
                        group-hover:text-accent dark:group-hover:text-dark-accent
                        transition-colors
                        line-clamp-2
                        mb-1.5
                      "
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-mono text-[13px] text-text-secondary dark:text-dark-text-secondary line-clamp-2 leading-6 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div
                      className="
                        font-mono text-[11px] sm:text-xs
                        text-text-secondary dark:text-dark-text-secondary
                        flex items-center gap-3
                      "
                    >
                      {(item.source?.name || item.sourceName) && (
                        <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent px-1.5 py-0.5">
                          {item.source?.name || item.sourceName}
                        </span>
                      )}
                      {item.publishedAt && (
                        <span>{formatTimeLabel(item.publishedAt)}</span>
                      )}
                      <span className="ml-auto text-accent dark:text-dark-accent opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="hidden sm:inline">原文</span> ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
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
