import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [totalArticles, recentArticles, viewsResult, pendingComments, draftCount, publishedCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { name: true } },
          tags: {
            include: { tag: { select: { name: true } } },
          },
        },
      }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.comment.count({ where: { status: 'pending' } }),
      prisma.article.count({ where: { status: 'draft' } }),
      prisma.article.count({ where: { status: 'published' } }),
    ])

  return NextResponse.json({
    totalArticles,
    recentArticles: recentArticles.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
    })),
    totalViews: viewsResult._sum.viewCount || 0,
    pendingComments,
    draftCount,
    publishedCount,
  })
}
