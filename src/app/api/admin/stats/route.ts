import { NextResponse } from 'next/server'
import { auth } from '@/../auth'
import {
  getStatsOverview,
  getViewsByDay,
  getTopArticles,
  getCommentTrend,
  getTagDistribution,
} from '@/lib/stats'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = Number(searchParams.get('period')) || 30
  const days = [7, 30, 90].includes(period) ? period : 30

  const [overview, viewsByDay, topArticles, commentTrend, tagDistribution] = await Promise.all([
    getStatsOverview(days),
    getViewsByDay(days),
    getTopArticles(days, 10),
    getCommentTrend(days),
    getTagDistribution(),
  ])

  return NextResponse.json({
    overview,
    viewsByDay,
    topArticles,
    commentTrend,
    tagDistribution,
  })
}
