import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  fetchAllActiveSources: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/../auth', () => ({
  auth: mocks.auth,
}))

vi.mock('@/lib/rss-fetcher', () => ({
  fetchAllActiveSources: mocks.fetchAllActiveSources,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}))

describe('POST /api/admin/fetch-news', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires an authenticated user', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/fetch-news/route')

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
    expect(mocks.fetchAllActiveSources).not.toHaveBeenCalled()
  })

  it('fetches all active sources and returns aggregate statistics', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'user-1' } })
    mocks.fetchAllActiveSources.mockResolvedValue([
      {
        source: 'Source A',
        inserted: 2,
        updated: 1,
        filtered: 4,
        failed: 0,
        errorMessage: null,
      },
      {
        source: 'Source B',
        inserted: 0,
        updated: 3,
        filtered: 2,
        failed: 1,
        errorMessage: 'timeout',
      },
    ])
    const { POST } = await import('@/app/api/admin/fetch-news/route')

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mocks.fetchAllActiveSources).toHaveBeenCalledOnce()
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/news')
    expect(body).toEqual({
      results: [
        {
          source: 'Source A',
          inserted: 2,
          updated: 1,
          filtered: 4,
          failed: 0,
          errorMessage: null,
        },
        {
          source: 'Source B',
          inserted: 0,
          updated: 3,
          filtered: 2,
          failed: 1,
          errorMessage: 'timeout',
        },
      ],
      summary: {
        inserted: 2,
        updated: 4,
        filtered: 6,
        failed: 1,
        errors: 1,
      },
    })
  })
})
