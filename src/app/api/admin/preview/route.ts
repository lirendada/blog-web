import { auth } from '@/../auth'
import { markdownToHtml } from '@/lib/markdown'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content } = await request.json()
    const html = await markdownToHtml(content || '')
    return NextResponse.json({ html })
  } catch (error) {
    console.error('Preview render failed:', error)
    return NextResponse.json({ html: '' }, { status: 500 })
  }
}
