import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined

  const where = {
    ...(status && status !== 'all' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({
    articles: articles.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, excerpt, coverImage, status, categoryId, slug, tags } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const articleSlug = slug?.trim() || generateSlug(title)

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug: articleSlug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        status: status || 'draft',
        slug: articleSlug,
        categoryId: categoryId || null,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const trimmed = tagName.trim()
        if (!trimmed) continue

        const tag = await prisma.tag.upsert({
          where: { name: trimmed },
          update: {},
          create: {
            name: trimmed,
            slug: trimmed.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || `tag-${Date.now()}`,
          },
        })

        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        })
      }
    }

    // Return the article with relations
    const result = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    })

    return NextResponse.json({
      ...result,
      tags: result!.tags.map((at) => at.tag),
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
