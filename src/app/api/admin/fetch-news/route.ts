import { auth } from '@/../auth'
import { fetchAllActiveSources } from '@/lib/rss-fetcher'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await fetchAllActiveSources()
    const summary = results.reduce(
      (total, result) => ({
        inserted: total.inserted + result.inserted,
        updated: total.updated + result.updated,
        filtered: total.filtered + result.filtered,
        failed: total.failed + result.failed,
        errors: total.errors + (result.errorMessage ? 1 : 0),
      }),
      { inserted: 0, updated: 0, filtered: 0, failed: 0, errors: 0 }
    )

    if (summary.inserted > 0 || summary.updated > 0) {
      revalidatePath('/news')
    }

    return NextResponse.json({ results, summary })
  } catch (error) {
    console.error('[admin] 手动抓取资讯失败:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
