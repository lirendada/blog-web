import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sources = await prisma.newsSource.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { newsItems: true } } },
  })

  return NextResponse.json({ sources })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, feedUrl, siteUrl, type } = await request.json()
    if (!name || !feedUrl) {
      return NextResponse.json({ error: 'Name and feed URL are required' }, { status: 400 })
    }

    const source = await prisma.newsSource.create({
      data: { name, feedUrl, siteUrl: siteUrl || null, type: type || 'rss' },
    })

    return NextResponse.json({ source }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes('Unique') ? 'Feed URL already exists' : 'Failed to create source'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
