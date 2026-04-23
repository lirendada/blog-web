import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { calculateReadingTime, formatDate } from '@/lib/utils'
import Typewriter from '@/components/ui/Typewriter'
import TagCloud from '@/components/ui/TagCloud'
import HotArticlesCarousel from '@/components/ui/HotArticlesCarousel'

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

export const revalidate = 1800

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
    take: 5,
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

export default async function HomePage() {
  const [tags, latestArticles, hotArticles] = await Promise.all([
    getTags(),
    getLatestArticles(),
    getHotArticles(),
  ])

  const topicTags = tags.slice(0, 18)
  const maxCount = topicTags.length > 0 ? Math.max(...topicTags.map((t) => t._count.articles)) : 1
  const featuredArticle = latestArticles[0]
  const sideArticles = latestArticles.slice(1, 5)
  const wanderArticle =
    hotArticles.find((article) => article.slug !== featuredArticle?.slug)
    ?? latestArticles.find((article) => article.slug !== featuredArticle?.slug)

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
                texts={['写字、编码、用爱发电。', '记录技术与生活。', 'Keep it simple.']}
                speed={100}
                deleteSpeed={50}
                pauseDuration={2500}
                cursorClassName="text-accent dark:text-dark-accent font-light"
              />
            </div>
            <p className="max-w-xl text-base md:text-lg leading-8 text-text-secondary dark:text-dark-text-secondary">
              一个关于编程、技术与日常思考的个人空间。这里更像一张长期摊开的书桌：算法题、工程项目、技术碎片和偶尔的生活记录都先放在这里。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={featuredArticle ? `/articles/${featuredArticle.slug}` : '/articles'}
                className="home-primary-link"
              >
                读最新文章
              </Link>
              <Link href="/articles" className="home-secondary-link">
                全部文章
              </Link>
              {wanderArticle && (
                <Link href={`/articles/${wanderArticle.slug}`} className="home-secondary-link">
                  随手翻一篇
                </Link>
              )}
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
          <section className="home-section home-topic-index">
            <div className="home-section-heading">
              <div>
                <p className="home-section-kicker">topic index</p>
                <h2 className="home-section-title">经常翻到的主题</h2>
              </div>
              <Link href="/tags" className="home-text-link">
                全部标签
              </Link>
            </div>
            <TagCloud tags={topicTags} maxCount={maxCount} />
          </section>
        )}

        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <p className="home-section-kicker">recent writing</p>
              <h2 className="home-section-title">最近写下</h2>
            </div>
            <Link href="/articles" className="home-text-link">
              文章归档
            </Link>
          </div>

          {featuredArticle ? (
            <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <Link href={`/articles/${featuredArticle.slug}`} className="home-feature-card group">
                <span className="home-card-label">latest</span>
                <h3 className="font-heading text-3xl leading-tight text-text dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                  {featuredArticle.title}
                </h3>
                {featuredArticle.excerpt && (
                  <p className="mt-4 text-sm leading-7 text-text-secondary dark:text-dark-text-secondary line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                  {featuredArticle.publishedAt && <span>{formatDate(featuredArticle.publishedAt)}</span>}
                  <span>{calculateReadingTime(featuredArticle.content)}</span>
                  <span>{featuredArticle.viewCount} 次翻阅</span>
                </div>
              </Link>

              <div className="home-recent-list">
                {sideArticles.map((article, index) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="home-recent-row group">
                    <span className="font-mono text-xs text-rose dark:text-dark-rose">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-lg leading-snug text-text dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                        {article.title}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                        {article.publishedAt ? formatDate(article.publishedAt) : '未标注日期'} · {calculateReadingTime(article.content)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-mono text-sm text-center py-12 text-text-secondary dark:text-dark-text-secondary">
              暂无文章
            </p>
          )}
        </section>

        <section className="home-section pb-14 overflow-visible">
          <HotArticlesCarousel
            title="被反复翻到"
            articles={hotArticles}
          />
          <div className="text-center mt-8">
            <Link href="/articles" className="home-text-link">
              查看全部文章
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
