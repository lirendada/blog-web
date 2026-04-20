import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'

const parser = new Parser({ timeout: 10000 })

export async function fetchFeed(sourceId: string) {
  const source = await prisma.newsSource.findUnique({ where: { id: sourceId } })
  if (!source || !source.active) {
    return { source: source?.name || 'Unknown', fetched: 0, error: 'Source not found or inactive' }
  }

  try {
    const feed = await parser.parseURL(source.feedUrl)
    let fetched = 0

    for (const item of feed.items.slice(0, 20)) {
      const url = item.link || item.guid
      if (!url) continue

      await prisma.newsItem.upsert({
        where: { url },
        update: {
          title: item.title || 'Untitled',
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          fetchedAt: new Date(),
        },
        create: {
          title: item.title || 'Untitled',
          url,
          sourceId: source.id,
          sourceName: source.name,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        },
      }).then(() => { fetched++ }).catch(() => {})
    }

    await prisma.newsSource.update({
      where: { id: sourceId },
      data: { lastFetched: new Date() },
    })

    return { source: source.name, fetched, error: null }
  } catch (error) {
    return { source: source.name, fetched: 0, error: String(error) }
  }
}

export async function fetchAllActiveSources() {
  const sources = await prisma.newsSource.findMany({ where: { active: true, type: 'rss' } })
  const results = []

  for (const source of sources) {
    const result = await fetchFeed(source.id)
    results.push(result)
  }

  return results
}
