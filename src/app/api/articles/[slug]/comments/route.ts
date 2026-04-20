import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug, status: 'published' },
    select: { id: true },
  })

  if (!article) {
    return NextResponse.json({ comments: [] })
  }

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug, status: 'published' },
    select: { id: true },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  try {
    const { author, content } = await request.json()
    if (!author?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 })
    }
    if (author.length > 50) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 })
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        articleId: article.id,
        author: author.trim(),
        content: content.trim(),
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}
