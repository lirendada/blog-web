import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ids, action } = await request.json()

  if (!Array.isArray(ids) || ids.length === 0 || !action) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  if (ids.length > 100) {
    return NextResponse.json({ error: 'Too many items' }, { status: 400 })
  }

  const statusMap: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
  }

  if (action === 'delete') {
    await prisma.comment.deleteMany({ where: { id: { in: ids } } })
  } else if (statusMap[action]) {
    await prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: { status: statusMap[action] },
    })
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ success: true, count: ids.length })
}
