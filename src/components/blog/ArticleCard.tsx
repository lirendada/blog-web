import Link from 'next/link'
import TagPill from '@/components/ui/TagPill'
import { formatDate, calculateReadingTime } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    content: string
    publishedAt: Date | null
    tags: { tag: { name: string; slug: string } }[]
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const readingTime = calculateReadingTime(article.content)

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article
        className="
          flex gap-5 pb-6
          border-b border-dashed border-border-light
          dark:border-dark-border-light
          transition-all duration-200 ease-out
          group-hover:-translate-y-0.5 group-hover:shadow-md
        "
      >
        {/* Cover image */}
        {article.coverImage && (
          <div className="shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              width={200}
              height={150}
              className="
                rounded-[var(--radius-md)]
                saturate-90
                object-cover
                w-[200px] h-[150px]
              "
            />
          </div>
        )}

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0">
          {/* Title */}
          <h3
            className="
              font-heading text-2xl leading-tight
              text-text dark:text-dark-text
              mb-1.5
            "
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className="
                line-clamp-2
                text-sm leading-relaxed
                text-text-secondary dark:text-dark-text-secondary
                mb-2
              "
            >
              {article.excerpt}
            </p>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {article.tags.map((t) => (
                <TagPill key={t.tag.slug} name={t.tag.name} slug={t.tag.slug} />
              ))}
            </div>
          )}

          {/* Date + reading time */}
          {article.publishedAt && (
            <p
              className="
                font-mono text-xs
                text-text-secondary dark:text-dark-text-secondary
              "
            >
              {formatDate(article.publishedAt)} &middot; {readingTime}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
