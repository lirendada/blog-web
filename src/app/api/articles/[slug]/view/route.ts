import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60_000

const ipAttempts = new Map<string, { count: number; resetAt: number }>()

function getStartOfDayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // IP rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const attempt = ipAttempts.get(ip)
  if (attempt && now < attempt.resetAt) {
    if (attempt.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ ok: true })
    }
    attempt.count++
  } else {
    ipAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
  }

  // Cookie dedup
  const cookieStore = await cookies()
  const cookieName = `viewed_${slug}`
  if (cookieStore.has(cookieName)) {
    return NextResponse.json({ ok: true })
  }

  // Increment view count + daily stats
  const today = getStartOfDayUTC()

  await Promise.all([
    prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.dailyView.upsert({
      where: { date: today },
      update: { views: { increment: 1 } },
      create: { date: today, views: 1 },
    }),
    prisma.articleDailyView.upsert({
      where: { articleId_date: { articleId: article.id, date: today } },
      update: { views: { increment: 1 } },
      create: { articleId: article.id, date: today, views: 1 },
    }),
  ])

  const response = NextResponse.json({ ok: true })
  response.cookies.set(cookieName, '1', {
    maxAge: 86400,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
