import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      _count: { select: {} },
    },
  })

  // Get article slug for each comment
  const articles = await prisma.article.findMany({
    where: { id: { in: [...new Set(comments.map((c) => c.articleId))] } },
    select: { id: true, slug: true, title: true },
  })
  const articleMap = Object.fromEntries(articles.map((a) => [a.id, a]))

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      article: articleMap[c.articleId] || null,
    })),
  })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
