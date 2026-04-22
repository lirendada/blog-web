import { prisma } from '@/lib/prisma'
import { markdownToHtml } from '@/lib/markdown'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { tags: { include: { tag: true } }, category: true },
  })

  const items = await Promise.all(
    articles.map(async (article) => {
      const content = await markdownToHtml(article.content)
      return `<item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/articles/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      ${article.category ? `<category>${article.category.name}</category>` : ''}
      ${article.tags.map(t => `<category>${t.tag.name}</category>`).join('')}
    </item>`
    })
  )

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>lirendada的小屋</title>
  <link>${siteUrl}</link>
  <description>个人博客</description>
  <language>zh-CN</language>
  <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
  ${items.join('')}
</channel>
</rss>`

  return new Response(rss, { headers: { 'Content-Type': 'application/xml' } })
}
