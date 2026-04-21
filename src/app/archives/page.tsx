import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: '归档',
  description: '按时间线浏览所有文章',
  alternates: { canonical: '/archives' },
}

export const revalidate = 3600

export default async function ArchivesPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
    },
  })

  // Group by year → month
  const grouped = articles.reduce<Record<string, Record<string, typeof articles>>>((acc, article) => {
    const date = article.publishedAt || article.createdAt
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    acc[year][month].push(article)
    return acc
  }, {})

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl text-text dark:text-dark-text mb-8">
        归档
      </h1>

      <div className="flex flex-col gap-10">
        {Object.entries(grouped).map(([year, months]) => (
          <section key={year}>
            <h2 className="font-heading text-2xl text-text dark:text-dark-text mb-4 pb-2 border-b border-dashed border-border-light dark:border-dark-border-light">
              {year}
            </h2>

            {Object.entries(months).map(([month, monthArticles]) => (
              <div key={month} className="mb-6 ml-4">
                <h3 className="font-mono text-sm text-accent dark:text-dark-accent mb-3">
                  {monthNames[parseInt(month) - 1]}
                </h3>

                <div className="flex flex-col gap-2 ml-2 border-l-2 border-dashed border-border-light dark:border-dark-border-light pl-4">
                  {monthArticles.map((article) => (
                    <div key={article.id} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary shrink-0 w-16">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
                          : ''}
                      </span>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="font-body text-sm text-text dark:text-dark-text hover:text-accent dark:hover:text-dark-accent transition-colors truncate"
                      >
                        {article.title}
                      </Link>
                      {article.category && (
                        <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
                          {article.category.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      {articles.length === 0 && (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary text-center py-12">
          暂无文章
        </p>
      )}
    </div>
  )
}
