import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: '标签',
  description: '浏览所有标签',
  alternates: { canonical: '/tags' },
}

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { name: 'asc' },
  })

  // Filter tags with at least one published article
  const tagsWithCount = tags.filter((t) => t._count.articles > 0)
  const maxCount = Math.max(...tagsWithCount.map((t) => t._count.articles))

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl text-text dark:text-dark-text mb-8">
        标签
      </h1>

      <div className="flex flex-wrap gap-3">
        {tagsWithCount.map((tag) => {
          const ratio = tag._count.articles / maxCount
          const size = ratio > 0.7 ? 'text-xl' : ratio > 0.4 ? 'text-base' : 'text-sm'
          return (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5
                border border-dashed border-border-light dark:border-dark-border-light
                rounded-[var(--radius-md)]
                font-mono ${size}
                text-accent dark:text-dark-accent
                hover:bg-accent-light dark:hover:bg-dark-accent-light
                transition-colors
              `}
            >
              #{tag.name}
              <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {tag._count.articles}
              </span>
            </Link>
          )
        })}
      </div>

      {tagsWithCount.length === 0 && (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary text-center py-12">
          暂无标签
        </p>
      )}
    </div>
  )
}
