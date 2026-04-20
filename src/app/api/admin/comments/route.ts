import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20))
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search')?.trim() || ''

  const where = {
    ...(status !== 'all' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { author: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [comments, total, pending, approved, rejected] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        article: { select: { id: true, slug: true, title: true } },
        _count: { select: { replies: true } },
      },
    }),
    prisma.comment.count({ where }),
    prisma.comment.count({ where: { status: 'pending' } }),
    prisma.comment.count({ where: { status: 'approved' } }),
    prisma.comment.count({ where: { status: 'rejected' } }),
  ])

  return NextResponse.json({
    comments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    stats: { total: pending + approved + rejected, pending, approved, rejected },
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await request.json()
  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ comment })
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
