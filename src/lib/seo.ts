import type { Metadata } from 'next'

export function generateArticleMeta(article: {
  title: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
}): Metadata {
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.coverImage ? [article.coverImage] : undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
    },
  }
}
