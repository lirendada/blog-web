import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configs = await prisma.siteConfig.findMany()
  const data: Record<string, string> = {}
  for (const c of configs) {
    data[c.key] = c.value
  }
  return NextResponse.json({ configs: data })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { configs } = body as { configs: Record<string, string> }

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const updates = Object.entries(configs).map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )

    await prisma.$transaction(updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update site config:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
