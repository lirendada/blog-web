import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const data = await request.json()
    const updates: {
      name?: string
      feedUrl?: string
      siteUrl?: string | null
      active?: boolean
    } = {}

    if (data.name !== undefined) {
      const name = typeof data.name === 'string' ? data.name.trim() : ''
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }
      updates.name = name
    }

    if (data.feedUrl !== undefined) {
      const feedUrl = typeof data.feedUrl === 'string' ? data.feedUrl.trim() : ''
      if (!feedUrl) {
        return NextResponse.json({ error: 'Feed URL is required' }, { status: 400 })
      }
      updates.feedUrl = feedUrl
    }

    if (data.siteUrl !== undefined) {
      const siteUrl = typeof data.siteUrl === 'string' ? data.siteUrl.trim() : ''
      updates.siteUrl = siteUrl || null
    }

    if (data.active !== undefined) {
      if (typeof data.active !== 'boolean') {
        return NextResponse.json({ error: 'Active must be a boolean' }, { status: 400 })
      }
      updates.active = data.active
    }

    const source = await prisma.newsSource.update({
      where: { id },
      data: updates,
    })
    revalidatePath('/news')
    return NextResponse.json({ source })
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes('Unique') ? 'Feed URL already exists' : 'Failed to update'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.newsSource.delete({ where: { id } })
    revalidatePath('/news')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
