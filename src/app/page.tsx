import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ArticleCard from '@/components/blog/ArticleCard'

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

export const dynamic = 'force-dynamic'

async function getLatestArticles() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })
  return articles
}

async function getHotArticles() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      publishedAt: true,
    },
  })
  return articles
}

export default async function HomePage() {
  const [articles, hotArticles] = await Promise.all([
    getLatestArticles(),
    getHotArticles(),
  ])
  const latestArticle = articles[0]

  return (
    <>
    <JsonLd />
    <div className="max-w-[960px] w-full mx-auto px-6">
        {/* Hero - 个人名片 */}
        <section className="py-10">
          <h1
            className="
              font-heading
              text-4xl
              text-text dark:text-dark-text
              mb-2
            "
          >
            my_blog
          </h1>
          <p
            className="
              font-mono text-sm
              text-text-secondary dark:text-dark-text-secondary
              mb-4
            "
          >
            写字、编码、用爱发电。
          </p>
          {latestArticle && (
            <Link
              href={`/articles/${latestArticle.slug}`}
              className="
                font-mono text-sm text-accent dark:text-dark-accent
                hover:text-accent-hover dark:hover:text-dark-accent-hover
                transition-colors
              "
            >
              → 最新文章: {latestArticle.title}
              {latestArticle.publishedAt && (
                <span className="text-text-secondary dark:text-dark-text-secondary ml-2">
                  {formatDate(latestArticle.publishedAt)}
                </span>
              )}
            </Link>
          )}
        </section>

        {/* 虚线分隔 */}
        <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-8" />

        {/* 双栏内容 */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 pb-12">
          {/* 左栏: 最新文章 */}
          <section>
            <h2
              className="
                font-heading text-2xl
                text-text dark:text-dark-text
                mb-6
              "
            >
              最新文章
            </h2>
            {articles.length > 0 ? (
              <div className="flex flex-col gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
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

          {/* 右栏: 热门文章 */}
          <section>
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
              <div className="flex flex-col gap-3">
                {hotArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="
                      group flex items-start gap-3 p-3
                      border border-dashed border-border-light dark:border-dark-border-light
                      rounded-[var(--radius-md)]
                      hover:border-accent dark:hover:border-dark-accent
                      transition-colors
                    "
                  >
                    <span
                      className="
                        font-mono text-sm font-bold
                        text-accent dark:text-dark-accent
                        mt-0.5 shrink-0
                      "
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className="
                          font-heading text-base
                          text-text dark:text-dark-text
                          group-hover:text-accent dark:group-hover:text-dark-accent
                          transition-colors
                          line-clamp-2
                        "
                      >
                        {article.title}
                      </h3>
                      <div
                        className="
                          font-mono text-xs
                          text-text-secondary dark:text-dark-text-secondary
                          mt-1 flex items-center gap-2
                        "
                      >
                        <span>{article.viewCount} 次阅读</span>
                        {article.publishedAt && (
                          <span>{formatDate(article.publishedAt)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
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
    </div>
    </>
  )
}
