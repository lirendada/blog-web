import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { markdownToHtml } from '@/lib/markdown'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import ArticleContent from '@/components/blog/ArticleContent'
import TableOfContents from '@/components/blog/TableOfContents'
import LikeButton from '@/components/blog/LikeButton'
import Comments from '@/components/blog/Comments'
import TagPill from '@/components/ui/TagPill'
import ReadingProgress from '@/components/ui/ReadingProgress'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!article || article.status !== 'published') {
    return null
  }

  return article
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: 'Not Found' }
  }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      tags: article.tags.map((t) => t.tag.name),
      ...(article.coverImage && { images: [{ url: article.coverImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt ?? undefined,
      ...(article.coverImage && { images: [article.coverImage] }),
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const html = await markdownToHtml(article.content)
  const readingTime = calculateReadingTime(article.content)
  const cookieStore = await cookies()
  const initialLiked = cookieStore.has(`liked_${article.slug}`)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt?.toISOString(),
    author: { '@type': 'Person', name: 'my_blog' },
    url: `${siteUrl}/articles/${article.slug}`,
    ...(article.coverImage && { image: article.coverImage }),
    keywords: article.tags.map((t) => t.tag.name).join(', '),
  }

  // Related articles (same tags or category, excluding current)
  const tagIds = article.tags.map((t) => t.tagId)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: 'published',
      id: { not: article.id },
      OR: [
        ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
        ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
      ],
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  })

  // Fire-and-forget viewCount increment
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      // silently ignore
    })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      <div className="max-w-[680px] mx-auto px-6 pt-8 pb-16">
        {/* Back link */}
        <Link
          href="/articles"
          className="
            inline-flex items-center gap-1
            font-mono text-sm
            text-navy dark:text-dark-accent
            hover:text-accent dark:hover:text-accent
            transition-colors duration-150
            mb-6
          "
        >
          &larr; 返回博客
        </Link>

        {/* Title */}
        <h1
          className="
            font-heading text-3xl leading-tight
            text-text dark:text-dark-text
            mb-4
          "
        >
          {article.title}
        </h1>

        {/* Meta line */}
        <div
          className="
            flex flex-wrap items-center gap-3
            font-mono text-xs
            text-text-secondary dark:text-dark-text-secondary
            mb-4
          "
        >
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          <span>&middot;</span>
          <span>约{readingTime}</span>
          {article.category && (
            <>
              <span>&middot;</span>
              <span className="text-accent dark:text-dark-accent">
                {article.category.name}
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {article.tags.map((t) => (
              <TagPill key={t.tag.slug} name={t.tag.name} slug={t.tag.slug} />
            ))}
          </div>
        )}

        {/* Dashed separator */}
        <div
          className="border-b border-dashed border-border-light dark:border-dark-border-light mb-8"
        />

        {/* Content + Floating TOC */}
        <div className="relative">
          <div className="hidden xl:block absolute right-[calc(100%+32px)] top-0">
            <TableOfContents html={html} />
          </div>
          <ArticleContent html={html} />
        </div>

        {/* Like button */}
        <LikeButton slug={article.slug} initialCount={article.likeCount} initialLiked={initialLiked} />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-dashed border-border-light dark:border-dark-border-light">
            <h2 className="font-heading text-xl text-text dark:text-dark-text mb-4">
              相关文章
            </h2>
            <div className="flex flex-col gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}`}
                  className="group flex items-center gap-3 p-3 border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] hover:border-accent/40 dark:hover:border-dark-accent/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm text-text dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors truncate">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary line-clamp-1 mt-0.5">
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                  {related.publishedAt && (
                    <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
                      {formatDate(related.publishedAt)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <Comments slug={article.slug} />
      </div>
    </>
  )
}
