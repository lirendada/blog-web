import { prisma } from '@/lib/prisma'

function getDaysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export async function getStatsOverview(days: number) {
  const since = getDaysAgo(days)

  const [totalViewsResult, totalArticles, totalComments, allArticles] = await Promise.all([
    prisma.dailyView.aggregate({
      _sum: { views: true },
      where: { date: { gte: since } },
    }),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.comment.count({ where: { createdAt: { gte: since } } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
  ])

  const periodViews = totalViewsResult._sum.views || 0
  const lifetimeViews = allArticles._sum.viewCount || 0

  return {
    periodViews,
    totalArticles,
    totalComments,
    lifetimeViews,
    avgViewsPerArticle: totalArticles > 0 ? Math.round(lifetimeViews / totalArticles) : 0,
  }
}

export async function getViewsByDay(days: number) {
  const since = getDaysAgo(days)

  const rows = await prisma.dailyView.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'asc' },
    select: { date: true, views: true },
  })

  // Fill gaps with zero
  const result: { date: string; views: number }[] = []
  const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r.views]))

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, views: map.get(key) || 0 })
  }

  return result
}

export async function getTopArticles(days: number, limit = 10) {
  const since = getDaysAgo(days)

  const rows = await prisma.articleDailyView.groupBy({
    by: ['articleId'],
    where: { date: { gte: since } },
    _sum: { views: true },
    orderBy: { _sum: { views: 'desc' } },
    take: limit,
  })

  const articleIds = rows.map((r) => r.articleId)
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, title: true, slug: true, viewCount: true },
  })

  const articleMap = new Map(articles.map((a) => [a.id, a]))

  return rows
    .map((r) => {
      const article = articleMap.get(r.articleId)
      if (!article) return null
      return {
        ...article,
        periodViews: r._sum.views || 0,
      }
    })
    .filter(Boolean)
}

export async function getCommentTrend(days: number) {
  const since = getDaysAgo(days)

  const rows = await prisma.comment.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const map = new Map<string, number>()
  for (const r of rows) {
    const key = r.createdAt.toISOString().slice(0, 10)
    map.set(key, (map.get(key) || 0) + 1)
  }

  const result: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map.get(key) || 0 })
  }

  return result
}

export async function getTagDistribution() {
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
      articles: {
        select: {
          article: {
            select: { viewCount: true },
          },
        },
      },
    },
  })

  return tags
    .map((tag) => ({
      name: tag.name,
      views: tag.articles.reduce((sum, at) => sum + at.article.viewCount, 0),
      articleCount: tag.articles.length,
    }))
    .filter((t) => t.views > 0)
    .sort((a, b) => b.views - a.views)
}
