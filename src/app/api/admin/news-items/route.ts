import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const sourceId = searchParams.get('sourceId') || undefined
  const pageSize = 20

  const where = { ...(sourceId ? { sourceId } : {}) }
  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsItem.count({ where }),
  ])

  return NextResponse.json({
    items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, url, sourceName, publishedAt, description } = await request.json()
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    // Find or create a manual source for this item
    let source = await prisma.newsSource.findFirst({ where: { type: 'manual' } })
    if (!source) {
      source = await prisma.newsSource.create({
        data: { name: '手动添加', feedUrl: 'manual', type: 'manual' },
      })
    }

    const item = await prisma.newsItem.create({
      data: {
        title,
        url,
        description: description || null,
        sourceId: source.id,
        sourceName: sourceName || source.name,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes('Unique') ? 'URL already exists' : 'Failed to create'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
