import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { calculateReadingTime, formatDate } from '@/lib/utils'
import Typewriter from '@/components/ui/Typewriter'
import TagCloud from '@/components/ui/TagCloud'
import HotArticlesCarousel from '@/components/ui/HotArticlesCarousel'
import HomeRankingBoards, { type ExternalRankingSource, type RankingBoard } from '@/components/ui/HomeRankingBoards'

export const metadata: Metadata = {
  title: 'lirendada的小屋',
  description: 'lirendada 的小屋，记录技术与生活。',
  alternates: { canonical: '/' },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'lirendada的小屋',
        url: siteUrl,
        description: 'lirendada 的小屋，记录技术与生活。',
      },
      {
        '@type': 'Organization',
        name: 'lirendada的小屋',
        url: siteUrl,
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export const revalidate = 900

const NEWS_PREVIEW_LIMIT = 10

const externalRankingSources = [
  { key: 'weibo', title: '微博热搜', meta: '实时热点', href: 'https://s.weibo.com/top/summary' },
  { key: 'zhihu', title: '知乎热榜', meta: '讨论热度', href: 'https://www.zhihu.com/hot' },
  { key: '36kr', title: '36氪热榜', meta: '商业科技', href: 'https://www.36kr.com/hot-list/catalog' },
] satisfies ExternalRankingSource[]

async function getTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { name: 'asc' },
  })
  return tags
    .filter((t) => t._count.articles > 0)
    .sort((a, b) => b._count.articles - a._count.articles)
}

async function getLatestArticles() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 2,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      viewCount: true,
      tags: {
        include: {
          tag: { select: { name: true, slug: true } },
        },
      },
    },
  })
  return articles.map((a) => ({
    ...a,
    tags: a.tags.map((at) => at.tag),
  }))
}

async function getHotArticles() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { viewCount: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: {
        include: {
          tag: { select: { name: true, slug: true } },
        },
      },
    },
  })
  return articles.map((a) => ({
    ...a,
    tags: a.tags.map((at) => at.tag),
  }))
}

async function getLatestNewsItems() {
  return prisma.newsItem.findMany({
    orderBy: [
      { publishedAt: 'desc' },
      { fetchedAt: 'desc' },
    ],
    take: NEWS_PREVIEW_LIMIT,
    select: {
      id: true,
      title: true,
      url: true,
      sourceName: true,
    },
  })
}

type LatestNewsItem = Awaited<ReturnType<typeof getLatestNewsItems>>[number]

function buildAiRanking(items: LatestNewsItem[]): RankingBoard | null {
  if (items.length === 0) return null

  return {
    key: 'ai-news',
    title: 'AI 资讯',
    meta: '本地精选',
    href: '/news',
    featured: true,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      hot: item.sourceName || 'AI',
    })),
  }
}

export default async function HomePage() {
  const [tags, latestArticles, hotArticles, latestNewsItems] = await Promise.all([
    getTags(),
    getLatestArticles(),
    getHotArticles(),
    getLatestNewsItems(),
  ])

  const topicTags = tags
  const maxCount = topicTags.length > 0 ? Math.max(...topicTags.map((t) => t._count.articles)) : 1
  const featuredArticle = latestArticles[0]
  const wanderArticle =
    hotArticles.find((article) => article.slug !== featuredArticle?.slug)
    ?? latestArticles.find((article) => article.slug !== featuredArticle?.slug)
  const aiRanking = buildAiRanking(latestNewsItems)

  return (
    <>
      <JsonLd />
      <div className="home-page max-w-[1120px] w-full mx-auto px-6">
        <section className="home-hero grid gap-10 py-16 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-text-secondary dark:text-dark-text-secondary mb-5">
              Tomoe River Note / Personal Desk
            </p>
            <h1 className="font-heading text-[clamp(3.4rem,7vw,6.2rem)] leading-[0.94] tracking-[-0.05em] text-text dark:text-dark-text mb-7">
              <span className="block">lirendada</span>
              <span className="block text-[0.82em] tracking-[-0.04em]">的小屋</span>
            </h1>
            <div className="font-mono text-lg md:text-xl text-accent dark:text-dark-accent mb-4 min-h-[1.8em]">
              <Typewriter
                texts={['写字、编码、用热爱发电。', '用代码搭东西，用文字留痕迹。', 'Keep life simple.']}
                speed={100}
                deleteSpeed={50}
                pauseDuration={2500}
                cursorClassName="text-accent dark:text-dark-accent font-light"
              />
            </div>
            <p className="max-w-xl text-base md:text-lg leading-8 text-text-secondary dark:text-dark-text-secondary">
              这是我的数字客厅，门没锁。架子上堆着些博客，角落挂着心理学和哲学的碎片，还有块只贴值得看的 AI 资讯黑板。没有算法催你往下刷，想坐多久坐多久，自由逛，自由走。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={wanderArticle ? `/articles/${wanderArticle.slug}` : featuredArticle ? `/articles/${featuredArticle.slug}` : '/articles'}
                className="home-primary-link"
              >
                随手翻一篇
              </Link>
              <Link href="/articles" className="home-secondary-link">
                全部文章
              </Link>
            </div>
          </div>

          <aside className="home-note-card">
            <div className="home-note-tape" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent dark:text-dark-accent mb-5">
              latest note
            </p>
            {featuredArticle ? (
              <Link href={`/articles/${featuredArticle.slug}`} className="group block">
                <h2 className="font-heading text-3xl md:text-4xl leading-tight text-text dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                  {featuredArticle.title}
                </h2>
                {featuredArticle.excerpt && (
                  <p className="mt-5 text-sm leading-7 text-text-secondary dark:text-dark-text-secondary line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                  {featuredArticle.publishedAt && <span>{formatDate(featuredArticle.publishedAt)}</span>}
                  <span>{calculateReadingTime(featuredArticle.content)}</span>
                  {featuredArticle.tags.slice(0, 2).map((tag) => (
                    <span key={tag.slug} className="rounded-[var(--radius-sm)] bg-accent-light px-2 py-0.5 text-accent dark:bg-dark-accent-light dark:text-dark-accent">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </Link>
            ) : (
              <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary">
                暂无文章，先去博客列表看看。
              </p>
            )}
          </aside>
        </section>

        {topicTags.length > 0 && (
          <section className="py-10">
            <TagCloud tags={topicTags} maxCount={maxCount} />
          </section>
        )}

        <section className="home-section pb-14 overflow-visible">
          <HotArticlesCarousel
            title="你可能感兴趣的"
            articles={hotArticles}
          />
          <div className="text-center mt-8">
            <Link href="/articles" className="home-text-link">
              查看全部文章
            </Link>
          </div>
        </section>

        <section className="home-section home-news-section pb-16">
          <div className="home-section-heading">
            <div>
              <p className="home-section-kicker">hot rankings</p>
              <h2 className="home-section-title">资讯热度榜</h2>
            </div>
          </div>

          <HomeRankingBoards
            aiRanking={aiRanking}
            sources={externalRankingSources}
            limit={NEWS_PREVIEW_LIMIT}
          />
        </section>
      </div>
    </>
  )
}
