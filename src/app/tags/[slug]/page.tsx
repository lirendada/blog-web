import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ArticleCard from '@/components/blog/ArticleCard'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug } })
  if (!tag) return { title: 'Not Found' }
  return {
    title: `#${tag.name}`,
    description: `标签「${tag.name}」下的所有文章`,
    alternates: { canonical: `/tags/${tag.slug}` },
  }
}

export const dynamic = 'force-dynamic'

export default async function TagArticlesPage({ params }: TagPageProps) {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug } })

  if (!tag) notFound()

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      tags: { some: { tagId: tag.id } },
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  })

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12">
      <Link
        href="/tags"
        className="inline-flex items-center gap-1 font-mono text-sm text-navy dark:text-dark-accent hover:text-accent dark:hover:text-accent transition-colors mb-6"
      >
        &larr; 所有标签
      </Link>

      <h1 className="font-heading text-3xl text-text dark:text-dark-text mb-2">
        #{tag.name}
      </h1>
      <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary mb-8">
        共 {articles.length} 篇文章
      </p>

      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
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
