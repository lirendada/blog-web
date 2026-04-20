import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeText, sanitizeAuthor } from '@/lib/sanitize'
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
    where: { articleId: article.id, status: 'approved', parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'asc' },
      },
    },
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
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: '评论太频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const rawAuthor = body.author ?? ''
    const rawContent = body.content ?? ''
    const parentId = body.parentId ?? null

    const author = sanitizeAuthor(rawAuthor)
    const content = sanitizeText(rawContent)

    if (!author || !content) {
      return NextResponse.json(
        { error: '昵称和内容不能为空' },
        { status: 400 }
      )
    }
    if (author.length > 50) {
      return NextResponse.json(
        { error: '昵称太长' },
        { status: 400 }
      )
    }
    if (content.length > 2000) {
      return NextResponse.json(
        { error: '内容太长' },
        { status: 400 }
      )
    }

    if (parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, articleId: article.id, status: 'approved' },
      })
      if (!parent) {
        return NextResponse.json(
          { error: '回复的评论不存在' },
          { status: 400 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        articleId: article.id,
        author,
        content,
        status: 'pending',
        ip,
        parentId,
      },
    })

    return NextResponse.json(
      { comment, message: '评论已提交，等待审核' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    )
  }
}
