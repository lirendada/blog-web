import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Typewriter from '@/components/ui/Typewriter'
import TagCloud from '@/components/ui/TagCloud'
import StickerCard from '@/components/ui/StickerCard'

export const metadata: Metadata = {
  title: 'my_blog - 个人博客',
  description: '用爱发电的个人博客，记录技术与生活。',
  alternates: { canonical: '/' },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'my_blog',
        url: siteUrl,
        description: '用爱发电的个人博客，记录技术与生活。',
      },
      {
        '@type': 'Organization',
        name: 'my_blog',
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
      viewCount: true,
      publishedAt: true,
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
            my_blog
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
        <section className="pb-12">
          <h2
            className="
              font-heading text-2xl
              text-text dark:text-dark-text
              mb-6
            "
          >
            热门文章
          </h2>
          {hotArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {hotArticles.map((article, i) => (
                <StickerCard
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  index={i}
                  title={article.title}
                  viewCount={article.viewCount}
                  date={article.publishedAt ? formatDate(article.publishedAt) : null}
                  tags={article.tags}
                />
              ))}
            </div>
          ) : (
            <p
              className="
                font-mono text-sm
                text-text-secondary dark:text-dark-text-secondary
              "
            >
              暂无文章
            </p>
          )}
        </section>
    </div>
    </>
  )
}
