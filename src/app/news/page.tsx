import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDateHeader, getDateKey } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'
import TimeFilter from '@/components/ui/TimeFilter'
import NewsKeywords from '@/components/ui/NewsKeywords'

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

function getTimeRange(time: string | undefined): Date | undefined {
  if (!time) return undefined
  const now = new Date()
  switch (time) {
    case 'today': {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    case 'yesterday': {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    }
    case '7d': {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    }
    default:
      return undefined
  }
}

function getTimeEnd(time: string | undefined): Date | undefined {
  if (time === 'yesterday') {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  return undefined
}

interface PageProps {
  searchParams: Promise<{ page?: string; source?: string; time?: string }>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const sourceId = params.source || undefined
  const timeRange = params.time || undefined

  const timeStart = getTimeRange(timeRange)
  const timeEnd = getTimeEnd(timeRange)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (sourceId) where.sourceId = sourceId
  if (timeStart) {
    where.publishedAt = { gte: timeStart }
    if (timeEnd) where.publishedAt.lt = timeEnd
  }

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

  // Keywords from recent titles
  const recentTitles = await prisma.newsItem.findMany({
    select: { title: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  // Extract keywords from recent titles
  const stopWords = new Set(['的', '了', '在', '是', '和', '与', '将', '为', '中', '对', '上', '下', '不', '有', '等', '到', '也', '可', '已', '被', '由', '据', '向', '从', '以', '及', '或', '但', '把', '让', '给', '做', '没', '会', '能', '要', '就', '这', '那', '你', '我', '他', '她', '它', '们', '着', '过', '来', '去', '又', '还', '很', '更', '最', '都', '就', '年', '月', '日', '个', '一', '多', '大', '新', '出', '发', '称', '正式', '消息', 'IT', '36', '氪', '获悉', '4'])
  const wordCounts = new Map<string, number>()
  for (const item of recentTitles) {
    const words = item.title.match(/[a-zA-Z]{2,}|[一-鿿]{2,4}/g) || []
    for (const w of words) {
      if (stopWords.has(w)) continue
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1)
    }
  }
  const keywords = [...wordCounts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }))

  return (
    <div className="max-w-[1160px] w-full mx-auto px-6">
      <h1 className="font-heading text-3xl text-text dark:text-dark-text pt-10 pb-6">
        资讯
      </h1>

      <div className="flex gap-6">
        {/* 左侧边栏 */}
        <aside className="hidden sm:block w-[220px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">
            <TimeFilter />
            <NewsKeywords keywords={keywords} />
          </div>
        </aside>

        {/* 主内容区 */}
        <div className="flex-1 min-w-0">
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
      </div>
    </div>
  )
}
