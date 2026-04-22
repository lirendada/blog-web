import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ArticleCard from '@/components/blog/ArticleCard'
import Pagination from '@/components/ui/Pagination'

export const metadata: Metadata = {
  title: '博客 - lirendada的小屋',
  description: '所有博客文章列表。',
}

export const revalidate = 1800

const PAGE_SIZE = 10

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

async function getCategories() {
  return prisma.category.findMany({
    where: { type: 'blog' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}

async function getArticles(page: number, categorySlug?: string) {
  const where: Record<string, unknown> = { status: 'published' }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ])

  return {
    articles,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const categorySlug = params.category || undefined

  const [categories, { articles, totalPages }] = await Promise.all([
    getCategories(),
    getArticles(page, categorySlug),
  ])

  return (
    <div className="max-w-[960px] w-full mx-auto px-6">
        {/* 页面标题 */}
        <h1
          className="
            font-heading text-3xl
            text-text dark:text-dark-text
            pt-10 pb-6
          "
        >
          博客
        </h1>

        {/* 分类筛选 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-6">
            <a
              href="/articles"
              className={`
                inline-block rounded-[var(--radius-sm)] px-3 py-1
                font-mono text-xs
                transition-colors
                ${
                  !categorySlug
                    ? 'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent'
                    : 'bg-bg-secondary text-text-secondary dark:bg-dark-bg-secondary dark:text-dark-text-secondary hover:text-accent dark:hover:text-dark-accent'
                }
              `}
            >
              全部
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className={`
                  inline-block rounded-[var(--radius-sm)] px-3 py-1
                  font-mono text-xs
                  transition-colors
                  ${
                    categorySlug === cat.slug
                      ? 'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent'
                      : 'bg-bg-secondary text-text-secondary dark:bg-dark-bg-secondary dark:text-dark-text-secondary hover:text-accent dark:hover:text-dark-accent'
                  }
                `}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* 虚线分隔 */}
        <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-8" />

        {/* 文章列表 */}
        {articles.length > 0 ? (
          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p
            className="
              font-mono text-sm text-center py-16
              text-text-secondary dark:text-dark-text-secondary
            "
          >
            暂无文章
          </p>
        )}

        {/* 分页 */}
        <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}
