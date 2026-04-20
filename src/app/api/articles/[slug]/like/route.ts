import { prisma } from '@/lib/prisma'
import { NextResponse, cookies } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Check cookie to prevent duplicate likes (UX-level only)
  const cookieStore = await cookies()
  const liked = cookieStore.get(`liked_${slug}`)
  if (liked) {
    return NextResponse.json({ error: 'Already liked' }, { status: 409 })
  }

  // Atomic increment
  const article = await prisma.article.updateMany({
    where: { slug, status: 'published' },
    data: { likeCount: { increment: 1 } },
  })

  if (article.count === 0) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  // Set cookie (30 days)
  const response = NextResponse.json({ success: true })
  response.cookies.set(`liked_${slug}`, '1', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
