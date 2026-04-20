import { prisma } from './prisma'

export async function checkRateLimit(ip: string): Promise<{ success: boolean; remaining: number }> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60_000)
  const oneHourAgo = new Date(now.getTime() - 3_600_000)

  const [perMinute, perHour] = await Promise.all([
    prisma.comment.count({
      where: { ip, createdAt: { gte: oneMinuteAgo } },
    }),
    prisma.comment.count({
      where: { ip, createdAt: { gte: oneHourAgo } },
    }),
  ])

  if (perMinute >= 3) {
    return { success: false, remaining: 0 }
  }
  if (perHour >= 10) {
    return { success: false, remaining: 0 }
  }

  return { success: true, remaining: Math.min(3 - perMinute, 10 - perHour) }
}
