import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'

const parser = new Parser({ timeout: 10000 })

const MAX_AGE_DAYS = 7

export type FeedFetchResult = {
  source: string
  inserted: number
  updated: number
  filtered: number
  failed: number
  errorMessage: string | null
}

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

function parseFeedDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function createEmptyResult(source: string): FeedFetchResult {
  return {
    source,
    inserted: 0,
    updated: 0,
    filtered: 0,
    failed: 0,
    errorMessage: null,
  }
}

export async function fetchFeed(sourceId: string): Promise<FeedFetchResult> {
  const source = await prisma.newsSource.findUnique({ where: { id: sourceId } })
  if (!source || !source.active) {
    return {
      ...createEmptyResult(source?.name || 'Unknown'),
      errorMessage: 'Source not found or inactive',
    }
  }

  const result = createEmptyResult(source.name)

  try {
    const feed = await parser.parseURL(source.feedUrl)

    for (const item of feed.items.slice(0, 30)) {
      const url = item.link || item.guid
      if (!url) continue

      const title = item.title || 'Untitled'
      const description = item.contentSnippet
        ? item.contentSnippet.slice(0, 300)
        : null

      // Only keep AI-related items
      if (!isAIRelated(title, description)) {
        result.filtered++
        continue
      }

      try {
        const existing = await prisma.newsItem.findUnique({
          where: { url },
          select: { id: true },
        })
        const publishedAt = parseFeedDate(item.pubDate)

        if (existing) {
          await prisma.newsItem.update({
            where: { id: existing.id },
            data: {
              title,
              description,
              publishedAt,
              fetchedAt: new Date(),
              sourceName: source.name,
            },
          })
          result.updated++
        } else {
          await prisma.newsItem.create({
            data: {
              title,
              url,
              description,
              sourceId: source.id,
              sourceName: source.name,
              publishedAt,
            },
          })
          result.inserted++
        }
      } catch (error) {
        result.failed++
        console.error(`[rss] 单条资讯写入失败: ${source.name} ${url}`, error)
      }
    }
  } catch (error) {
    result.errorMessage = String(error)
  } finally {
    try {
      await prisma.newsSource.update({
        where: { id: sourceId },
        data: { lastFetched: new Date() },
      })
    } catch (error) {
      console.error(`[rss] 更新 lastFetched 失败: ${source.name}`, error)
    }
  }

  return result
}

export async function fetchAllActiveSources(): Promise<FeedFetchResult[]> {
  const sources = await prisma.newsSource.findMany({ where: { active: true, type: 'rss' } })

  const settledResults = await Promise.allSettled(
    sources.map(source => fetchFeed(source.id))
  )

  return settledResults.map((result, index) => {
    if (result.status === 'fulfilled') return result.value

    return {
      ...createEmptyResult(sources[index]?.name || 'Unknown'),
      errorMessage: String(result.reason),
    }
  })
}

export async function cleanOldNews() {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000)
  const result = await prisma.newsItem.deleteMany({
    where: {
      OR: [
        { publishedAt: { lt: cutoff } },
        { publishedAt: null, fetchedAt: { lt: cutoff } },
      ],
    },
  })
  return result.count
}
