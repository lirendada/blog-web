import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const exclude = searchParams.get('exclude')?.split(',').filter(Boolean) || []
  const count = Math.min(Number(searchParams.get('count') || 6), 12)

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(exclude.length > 0 && { id: { notIn: exclude } }),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: {
        include: { tag: { select: { name: true, slug: true } } },
      },
    },
  })

  const shuffled = articles.sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)

  return NextResponse.json(
    picked.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
    }))
  )
}
