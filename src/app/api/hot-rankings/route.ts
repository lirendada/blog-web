import { NextResponse } from 'next/server'

export const revalidate = 900

type RankingItem = {
  id: string
  title: string
  url: string
  hot?: string
}

type RankingBoard = {
  key: string
  title: string
  meta: string
  href: string
  items: RankingItem[]
}

type WeiboHotItem = {
  word?: string
  note?: string
  word_scheme?: string
  raw_hot?: number
}

type WeiboHotResponse = {
  data?: {
    band_list?: WeiboHotItem[]
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 20
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36'

function parseLimit(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawLimit = Number.parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  if (Number.isNaN(rawLimit)) return DEFAULT_LIMIT
  return Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, '')).trim()
}

function isValidRankingUrl(value: string) {
  try {
    const url = new URL(decodeHtml(value))
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isTemplatePlaceholder(value: string) {
  return value.includes("' +") || value.includes('"+') || value.includes('+ "') || value.includes('v.')
}

function formatHot(value?: number) {
  if (!value) return undefined
  if (value >= 10000) return `${Math.round(value / 10000)}万`
  return value.toLocaleString('zh-CN')
}

async function fetchWeiboRanking(limit: number): Promise<RankingBoard> {
  const res = await fetch('https://weibo.com/ajax/statuses/hot_band', {
    next: { revalidate },
    headers: {
      accept: 'application/json',
      referer: 'https://weibo.com/',
      'user-agent': USER_AGENT,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch Weibo ranking')

  const payload = (await res.json()) as WeiboHotResponse
  const items = (payload.data?.band_list || [])
    .filter((item) => item.word || item.note)
    .slice(0, limit)
    .map((item, index) => {
      const title = item.note || item.word || '微博热搜'
      const query = item.word_scheme || item.word || title

      return {
        id: `weibo-${index}-${item.word || title}`,
        title,
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(query)}`,
        hot: formatHot(item.raw_hot),
      }
    })

  return {
    key: 'weibo',
    title: '微博热搜',
    meta: '实时热点',
    href: 'https://s.weibo.com/top/summary',
    items,
  }
}

function parseTophubRows(html: string, sourceKey: string, fallbackHref: string, limit: number) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/g) || []
  const items: RankingItem[] = []

  for (const [index, row] of rows.entries()) {
    const anchors = [...row.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    const titleAnchor = anchors.find(([raw, href, content]) => {
      const title = stripTags(content)
      return (
        title.length > 0
        && isValidRankingUrl(href)
        && !isTemplatePlaceholder(raw)
        && !isTemplatePlaceholder(href)
        && !isTemplatePlaceholder(title)
      )
    })
    if (!titleAnchor) continue

    const [, href, content] = titleAnchor
    const title = stripTags(content)
    if (!title || isTemplatePlaceholder(title)) continue

    const hotMatch = row.match(/<td[^>]*class="ws"[^>]*>([\s\S]*?)<\/td>/)
    const hot = hotMatch ? stripTags(hotMatch[1]) : undefined
    const item: RankingItem = {
      id: `${sourceKey}-${index}-${title}`,
      title,
      url: decodeHtml(href) || fallbackHref,
    }

    if (hot) item.hot = hot
    items.push(item)
    if (items.length >= limit) break
  }

  return items
}

async function fetchTophubRanking(
  sourceKey: string,
  title: string,
  meta: string,
  href: string,
  limit: number,
): Promise<RankingBoard> {
  const res = await fetch(href, {
    next: { revalidate },
    headers: {
      accept: 'text/html',
      'user-agent': USER_AGENT,
    },
  })

  if (!res.ok) throw new Error(`Failed to fetch ${sourceKey} ranking`)

  const html = await res.text()
  return {
    key: sourceKey,
    title,
    meta,
    href,
    items: parseTophubRows(html, sourceKey, href, limit),
  }
}

export async function GET(request: Request) {
  const limit = parseLimit(request)

  const rankings = await Promise.allSettled([
    fetchWeiboRanking(limit),
    fetchTophubRanking('zhihu', '知乎热榜', '讨论热度', 'https://tophub.today/n/mproPpoq6O', limit),
    fetchTophubRanking('36kr', '36氪热榜', '商业科技', 'https://tophub.today/n/Q1Vd5Ko85R', limit),
  ])

  const boards = rankings
    .filter((result): result is PromiseFulfilledResult<RankingBoard> => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((board) => board.items.length > 0)

  return NextResponse.json({ boards })
}
