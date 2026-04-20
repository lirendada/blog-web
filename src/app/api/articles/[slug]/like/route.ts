import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cookieStore = await cookies()
  const hasLiked = cookieStore.get(`liked_${slug}`)

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, likeCount: true },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const response = NextResponse.json({ success: true })

  if (hasLiked) {
    // Unlike: only decrement if count > 0
    if (article.likeCount > 0) {
      await prisma.article.update({
        where: { id: article.id },
        data: { likeCount: { decrement: 1 } },
      })
    }
    response.cookies.set(`liked_${slug}`, '', { maxAge: 0, path: '/' })
  } else {
    // Like
    await prisma.article.update({
      where: { id: article.id },
      data: { likeCount: { increment: 1 } },
    })
    response.cookies.set(`liked_${slug}`, '1', {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  const updated = await prisma.article.findUnique({
    where: { id: article.id },
    select: { likeCount: true },
  })

  return NextResponse.json({ liked: !hasLiked, likeCount: Math.max(0, updated?.likeCount ?? 0) })
}
