import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
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
  return tags.filter((t) => t._count.articles > 0)
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
  const [tags, hotArticles] = await Promise.all([
    getTags(),
    getHotArticles(),
  ])

  const maxCount = tags.length > 0 ? Math.max(...tags.map((t) => t._count.articles)) : 1

  return (
    <>
    <JsonLd />
    <div className="max-w-[960px] w-full mx-auto px-6">
        {/* Hero */}
        <section className="py-20 md:py-28 text-center">
          <h1
            className="
              font-heading
              text-5xl md:text-6xl
              text-text dark:text-dark-text
              mb-6
            "
          >
            lirendada的小屋
          </h1>
          <div
            className="
              font-mono text-lg md:text-xl
              text-accent dark:text-dark-accent
              mb-3 min-h-[1.8em]
              flex items-center justify-center
            "
          >
            <Typewriter
              texts={['写字、编码、用爱发电。', '记录技术与生活。', 'Keep it simple.']}
              speed={100}
              deleteSpeed={50}
              pauseDuration={2500}
              cursorClassName="text-accent dark:text-dark-accent font-light"
            />
          </div>
          <p
            className="
              font-mono text-sm
              text-text-secondary dark:text-dark-text-secondary
              max-w-md mx-auto
            "
          >
            一个关于编程、技术与日常思考的个人空间
          </p>
        </section>

        {/* 标签云 */}
        {tags.length > 0 && (
          <section className="pb-10">
            <TagCloud tags={tags} maxCount={maxCount} />
          </section>
        )}

        {/* 热门文章 */}
        <section className="pb-12 pt-6 overflow-visible">
          <HotArticlesCarousel
            title="热门文章"
            articles={hotArticles}
          />
          <div className="text-center mt-8">
            <a
              href="/articles"
              className="
                inline-flex items-center gap-1.5
                font-mono text-sm
                text-text-secondary dark:text-dark-text-secondary
                hover:text-accent dark:hover:text-dark-accent
                transition-colors duration-200
              "
            >
              查看全部文章
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>
    </div>
    </>
  )
}
