import { auth } from '@/../auth'
import { NextResponse } from 'next/server'
import { fetchFeed, fetchAllActiveSources } from '@/lib/rss-fetcher'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sourceId } = await request.json()

    if (sourceId) {
      const result = await fetchFeed(sourceId)
      return NextResponse.json({ results: [result] })
    }

    const results = await fetchAllActiveSources()
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed: ' + String(error) }, { status: 500 })
  }
}
