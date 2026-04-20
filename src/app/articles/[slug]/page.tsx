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
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      tags: article.tags.map((t) => t.tag.name),
      ...(article.coverImage && { images: [{ url: article.coverImage }] }),
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
              <TagPill key={t.tag.slug} name={t.tag.name} />
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

        {/* Comments */}
        <Comments slug={article.slug} />
      </div>
    </>
  )
}
