import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const sourceId = searchParams.get('source') || undefined
  const pageSize = 20

  const where = { ...(sourceId ? { sourceId } : {}) }
  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        url: true,
        sourceName: true,
        sourceId: true,
        publishedAt: true,
      },
    }),
    prisma.newsItem.count({ where }),
  ])

  const sources = await prisma.newsSource.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    items,
    sources,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}
