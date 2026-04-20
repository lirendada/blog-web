import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  })
  const articleUrls = articles.map((a) => ({
    url: `http://localhost:3000/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  return [
    { url: 'http://localhost:3000', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'http://localhost:3000/articles', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...articleUrls,
  ]
}
