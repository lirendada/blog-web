import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'

const parser = new Parser({ timeout: 10000 })

const MAX_AGE_DAYS = 7

const AI_KEYWORDS = [
  // English
  'ai', 'artificial intelligence', 'gpt', 'llm', 'chatgpt', 'claude', 'gemini', 'deepseek',
  'openai', 'anthropic', 'machine learning', 'deep learning', 'neural network',
  'transformer', 'aigc', 'agi', 'copilot', 'midjourney', 'stable diffusion',
  'robot', 'autonomous', 'nlp', 'computer vision', 'diffusion model',
  // Chinese
  '人工智能', '大模型', '智能体', '机器学习', '深度学习', '神经网络',
  '机器人', '自动驾驶', '语音识别', '图像识别', '自然语言',
]

function isAIRelated(title: string, description?: string | null): boolean {
  const text = `${title} ${description || ''}`.toLowerCase()
  return AI_KEYWORDS.some(kw => text.includes(kw))
}

export async function fetchFeed(sourceId: string) {
  const source = await prisma.newsSource.findUnique({ where: { id: sourceId } })
  if (!source || !source.active) {
    return { source: source?.name || 'Unknown', fetched: 0, skipped: 0, error: 'Source not found or inactive' }
  }

  try {
    const feed = await parser.parseURL(source.feedUrl)
    let fetched = 0
    let skipped = 0

    for (const item of feed.items.slice(0, 30)) {
      const url = item.link || item.guid
      if (!url) continue

      const title = item.title || 'Untitled'
      const description = item.contentSnippet
        ? item.contentSnippet.slice(0, 300)
        : null

      // Only keep AI-related items
      if (!isAIRelated(title, description)) {
        skipped++
        continue
      }

      await prisma.newsItem.upsert({
        where: { url },
        update: {
          title,
          description,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          fetchedAt: new Date(),
        },
        create: {
          title,
          url,
          description,
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

    return { source: source.name, fetched, skipped, error: null }
  } catch (error) {
    return { source: source.name, fetched: 0, skipped: 0, error: String(error) }
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

export async function cleanOldNews() {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000)
  const result = await prisma.newsItem.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return result.count
}
