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
      include: {
        source: { select: { name: true } },
      },
    }),
    prisma.newsItem.count({ where }),
  ])

  return NextResponse.json({
    items: items.map(({ source, ...item }) => ({
      ...item,
      sourceName: source?.name || item.sourceName,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}
