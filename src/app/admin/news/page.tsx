'use client'

import { useState, useEffect, useCallback, type FormEvent } from 'react'

type NewsSource = {
  id: string
  name: string
  feedUrl: string
  siteUrl: string | null
  type: string
  active: boolean
  lastFetched: string | null
  _count: { newsItems: number }
}

type NewsItem = {
  id: string
  title: string
  url: string
  description: string | null
  sourceId: string
  sourceName: string | null
  publishedAt: string | null
  fetchedAt: string
}

type PaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type FetchSummary = {
  inserted: number
  updated: number
  filtered: number
  failed: number
  errors: number
}

type SourceDraft = {
  name: string
  feedUrl: string
  siteUrl: string
}

const emptyPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
}

function formatDateTime(value: string | null, fallback = '从未') {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: (number | 'ellipsis')[] = []

  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    ) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return pages
}

async function readError(res: Response, fallback: string) {
  try {
    const data = await res.json()
    return data.error || fallback
  } catch {
    return fallback
  }
}

export default function AdminNewsPage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [items, setItems] = useState<NewsItem[]>([])
  const [pagination, setPagination] = useState<PaginationState>(emptyPagination)
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [sourceMessage, setSourceMessage] = useState('')
  const [itemMessage, setItemMessage] = useState('')
  const [fetchMessage, setFetchMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newSiteUrl, setNewSiteUrl] = useState('')

  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<SourceDraft>({ name: '', feedUrl: '', siteUrl: '' })
  const [savingSourceId, setSavingSourceId] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [fetchingNews, setFetchingNews] = useState(false)
  const [selectedSourceId, setSelectedSourceId] = useState('all')
  const [itemPage, setItemPage] = useState(1)

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/news-sources')
      if (!res.ok) throw new Error(await readError(res, '加载 RSS 源失败'))

      const data = await res.json()
      setSources(data.sources || [])
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : '加载 RSS 源失败')
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  const loadItems = useCallback(async () => {
    setItemsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(itemPage) })
      if (selectedSourceId !== 'all') params.set('sourceId', selectedSourceId)

      const res = await fetch(`/api/admin/news-items?${params.toString()}`)
      if (!res.ok) throw new Error(await readError(res, '加载资讯失败'))

      const data = await res.json()
      setItems(data.items || [])
      setPagination(data.pagination || emptyPagination)
    } catch (error) {
      setItemMessage(error instanceof Error ? error.message : '加载资讯失败')
    } finally {
      setItemsLoading(false)
    }
  }, [itemPage, selectedSourceId])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const activeRssCount = sources.filter(source => source.type === 'rss' && source.active).length
  const totalItemCount = sources.reduce((sum, source) => sum + source._count.newsItems, 0)
  const latestFetched = sources.reduce<Date | null>((latest, source) => {
    if (!source.lastFetched) return latest

    const fetchedAt = new Date(source.lastFetched)
    if (Number.isNaN(fetchedAt.getTime())) return latest

    return !latest || fetchedAt > latest ? fetchedAt : latest
  }, null)

  const handleAddSource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newName.trim()
    const feedUrl = newFeedUrl.trim()

    if (!name || !feedUrl) {
      setSourceMessage('名称和 RSS Feed URL 必填')
      return
    }

    setSavingSourceId('new')
    setSourceMessage('')

    try {
      const res = await fetch('/api/admin/news-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, feedUrl, siteUrl: newSiteUrl.trim() }),
      })

      if (!res.ok) throw new Error(await readError(res, '添加 RSS 源失败'))

      setNewName('')
      setNewFeedUrl('')
      setNewSiteUrl('')
      setSourceMessage('RSS 源已添加，系统会在下一次定时任务中抓取')
      await loadSources()
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : '添加 RSS 源失败')
    } finally {
      setSavingSourceId(null)
    }
  }

  const startEditingSource = (source: NewsSource) => {
    setEditingSourceId(source.id)
    setEditDraft({
      name: source.name,
      feedUrl: source.feedUrl,
      siteUrl: source.siteUrl || '',
    })
    setSourceMessage('')
  }

  const handleUpdateSource = async (sourceId: string) => {
    const name = editDraft.name.trim()
    const feedUrl = editDraft.feedUrl.trim()

    if (!name || !feedUrl) {
      setSourceMessage('名称和 RSS Feed URL 必填')
      return
    }

    setSavingSourceId(sourceId)
    setSourceMessage('')

    try {
      const res = await fetch(`/api/admin/news-sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, feedUrl, siteUrl: editDraft.siteUrl.trim() }),
      })

      if (!res.ok) throw new Error(await readError(res, '保存 RSS 源失败'))

      setEditingSourceId(null)
      setSourceMessage('RSS 源已保存')
      await Promise.all([loadSources(), loadItems()])
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : '保存 RSS 源失败')
    } finally {
      setSavingSourceId(null)
    }
  }

  const handleToggleSource = async (source: NewsSource) => {
    setSavingSourceId(source.id)
    setSourceMessage('')

    try {
      const res = await fetch(`/api/admin/news-sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !source.active }),
      })

      if (!res.ok) throw new Error(await readError(res, '更新 RSS 源状态失败'))

      setSourceMessage(source.active ? 'RSS 源已停用' : 'RSS 源已启用')
      await loadSources()
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : '更新 RSS 源状态失败')
    } finally {
      setSavingSourceId(null)
    }
  }

  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`删除「${name}」及其所有资讯？`)) return

    setSavingSourceId(id)
    setSourceMessage('')

    try {
      const res = await fetch(`/api/admin/news-sources/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await readError(res, '删除 RSS 源失败'))

      setSourceMessage('RSS 源及其资讯已删除')
      await loadSources()

      if (selectedSourceId === id) {
        setSelectedSourceId('all')
        setItemPage(1)
      } else {
        await loadItems()
      }
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : '删除 RSS 源失败')
    } finally {
      setSavingSourceId(null)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('删除这条资讯？')) return

    setDeletingItemId(id)
    setItemMessage('')

    try {
      const res = await fetch(`/api/admin/news-items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await readError(res, '删除资讯失败'))

      setItemMessage('资讯已删除')
      await loadSources()

      if (items.length === 1 && itemPage > 1) {
        setItemPage(page => page - 1)
      } else {
        await loadItems()
      }
    } catch (error) {
      setItemMessage(error instanceof Error ? error.message : '删除资讯失败')
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleSourceFilterChange = (sourceId: string) => {
    setSelectedSourceId(sourceId)
    setItemPage(1)
    setItemMessage('')
  }

  const handleFetchNews = async () => {
    if (activeRssCount === 0) {
      setFetchMessage('没有启用中的 RSS 源，无法手动抓取')
      return
    }

    setFetchingNews(true)
    setFetchMessage('')

    try {
      const res = await fetch('/api/admin/fetch-news', { method: 'POST' })
      if (!res.ok) throw new Error(await readError(res, '手动抓取失败'))

      const data = await res.json()
      const summary = data.summary as FetchSummary | undefined
      if (summary) {
        setFetchMessage(
          `手动抓取完成：新增 ${summary.inserted}，更新 ${summary.updated}，过滤 ${summary.filtered}，单条失败 ${summary.failed}，源失败 ${summary.errors}`
        )
      } else {
        setFetchMessage('手动抓取完成')
      }

      await Promise.all([loadSources(), loadItems()])
    } catch (error) {
      setFetchMessage(error instanceof Error ? error.message : '手动抓取失败')
    } finally {
      setFetchingNews(false)
    }
  }

  const getEmptyMessage = () => {
    if (selectedSourceId !== 'all') return '当前来源下暂无资讯'
    if (sources.length === 0) return '还没有 RSS 源，先添加来源后等待定时任务抓取'
    if (activeRssCount === 0) return '没有启用中的 RSS 源，启用来源后系统会按定时任务抓取'
    return '启用中的 RSS 源尚未抓到内容'
  }

  if (sourcesLoading && itemsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px-64px)]">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text dark:text-dark-text">资讯管理</h1>
            <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
              RSS 定时聚合：每天 09:00 / 14:00 / 21:00 自动抓取，也可以在这里手动补抓
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <button
              type="button"
              onClick={handleFetchNews}
              disabled={fetchingNews || activeRssCount === 0}
              className="self-start sm:self-end font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1.5 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchingNews ? '抓取中...' : '立即抓取'}
            </button>
            <div className="grid grid-cols-3 gap-2 min-w-[360px] max-sm:min-w-0">
              <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] px-3 py-2 bg-bg-card dark:bg-dark-bg-card">
                <div className="font-[family-name:var(--font-mono)] text-[11px] text-text-secondary dark:text-dark-text-secondary">启用 RSS</div>
                <div className="font-[family-name:var(--font-heading)] text-xl text-text dark:text-dark-text">{activeRssCount}</div>
              </div>
              <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] px-3 py-2 bg-bg-card dark:bg-dark-bg-card">
                <div className="font-[family-name:var(--font-mono)] text-[11px] text-text-secondary dark:text-dark-text-secondary">资讯总数</div>
                <div className="font-[family-name:var(--font-heading)] text-xl text-text dark:text-dark-text">{totalItemCount}</div>
              </div>
              <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] px-3 py-2 bg-bg-card dark:bg-dark-bg-card">
                <div className="font-[family-name:var(--font-mono)] text-[11px] text-text-secondary dark:text-dark-text-secondary">最近抓取</div>
                <div className="font-[family-name:var(--font-mono)] text-sm text-text dark:text-dark-text">
                  {latestFetched ? formatDateTime(latestFetched.toISOString()) : '从未'}
                </div>
              </div>
            </div>
            {fetchMessage && (
              <p className="max-w-[520px] text-left sm:text-right font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                {fetchMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text">RSS 源</h2>
          {sourceMessage && (
            <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
              {sourceMessage}
            </p>
          )}
        </div>

        <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-4 bg-bg-card dark:bg-dark-bg-card mb-3">
          <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-[140px_minmax(220px,1fr)_220px_auto] gap-2 mb-4">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="名称"
              className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
            />
            <input
              value={newFeedUrl}
              onChange={(event) => setNewFeedUrl(event.target.value)}
              placeholder="RSS Feed URL"
              className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
            />
            <input
              value={newSiteUrl}
              onChange={(event) => setNewSiteUrl(event.target.value)}
              placeholder="网站 URL (可选)"
              className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
            />
            <button
              type="submit"
              disabled={savingSourceId === 'new'}
              className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSourceId === 'new' ? '添加中...' : '+ 添加'}
            </button>
          </form>

          {sources.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sources.map((source) => {
                const isEditing = editingSourceId === source.id
                const isSaving = savingSourceId === source.id

                return (
                  <div key={source.id} className="grid grid-cols-1 lg:grid-cols-[84px_minmax(0,1fr)_170px_150px_auto] gap-3 py-3 border-b border-dashed border-border-light dark:border-dark-border-light last:border-0">
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-[family-name:var(--font-mono)] ${source.active ? 'bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent' : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-secondary dark:text-dark-text-secondary'}`}>
                        {source.type === 'rss' ? 'RSS' : '遗留'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(220px,1fr)_220px] gap-2">
                          <input
                            value={editDraft.name}
                            onChange={(event) => setEditDraft(draft => ({ ...draft, name: event.target.value }))}
                            className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text"
                          />
                          <input
                            value={editDraft.feedUrl}
                            onChange={(event) => setEditDraft(draft => ({ ...draft, feedUrl: event.target.value }))}
                            className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text"
                          />
                          <input
                            value={editDraft.siteUrl}
                            onChange={(event) => setEditDraft(draft => ({ ...draft, siteUrl: event.target.value }))}
                            placeholder="网站 URL"
                            className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-[family-name:var(--font-mono)] text-sm text-text dark:text-dark-text truncate">
                            {source.name}
                            <span className="text-xs text-text-secondary dark:text-dark-text-secondary ml-2">{source._count.newsItems} 条</span>
                          </div>
                          <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary truncate mt-1">
                            {source.feedUrl}
                          </div>
                          {source.siteUrl && (
                            <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary truncate mt-0.5">
                              {source.siteUrl}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                      最近抓取<br />
                      <span className="text-text dark:text-dark-text">{formatDateTime(source.lastFetched)}</span>
                    </div>

                    <div className="font-[family-name:var(--font-mono)] text-xs">
                      <span className={source.active ? 'text-accent dark:text-dark-accent' : 'text-text-secondary dark:text-dark-text-secondary'}>
                        {source.active ? '启用中' : '已停用'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-start gap-2 justify-start lg:justify-end">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleUpdateSource(source.id)}
                            disabled={isSaving}
                            className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? '保存中...' : '保存'}
                          </button>
                          <button
                            onClick={() => setEditingSourceId(null)}
                            disabled={isSaving}
                            className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text transition-colors cursor-pointer disabled:opacity-50"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingSource(source)}
                            disabled={Boolean(savingSourceId)}
                            className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors cursor-pointer disabled:opacity-50"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleToggleSource(source)}
                            disabled={Boolean(savingSourceId)}
                            className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {source.active ? '停用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteSource(source.id, source.name)}
                            disabled={Boolean(savingSourceId)}
                            className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50"
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">暂无 RSS 源</p>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text">资讯列表</h2>
            <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
              共 {pagination.total} 条，当前第 {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages} 页
            </p>
          </div>

          <select
            value={selectedSourceId}
            onChange={(event) => handleSourceFilterChange(event.target.value)}
            className="bg-bg-card dark:bg-dark-bg-card border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-sm)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-text dark:text-dark-text focus:outline-none focus:border-accent dark:focus:border-dark-accent"
          >
            <option value="all">全部来源</option>
            {sources.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>

        {itemMessage && (
          <div className="mb-3 px-4 py-2 bg-bg-card dark:bg-dark-bg-card border border-dashed border-border-light dark:border-dark-border-light text-text-secondary dark:text-dark-text-secondary font-[family-name:var(--font-mono)] text-sm rounded-[var(--radius-sm)]">
            {itemMessage}
          </div>
        )}

        {itemsLoading ? (
          <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-6 bg-bg-card dark:bg-dark-bg-card">
            <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">资讯加载中...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_140px_auto] gap-3 py-3 border-b border-dashed border-border-light dark:border-dark-border-light">
                <div className="min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-[family-name:var(--font-mono)] text-sm text-text dark:text-dark-text hover:text-accent dark:hover:text-dark-accent transition-colors line-clamp-1">
                    {item.title}
                  </a>
                  {item.description && (
                    <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary line-clamp-1 mt-0.5">
                      {item.description}
                    </div>
                  )}
                  <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {item.sourceName || 'Unknown'}
                  </div>
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                  发布时间<br />
                  <span className="text-text dark:text-dark-text">{formatDateTime(item.publishedAt, '未知')}</span>
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                  抓取时间<br />
                  <span className="text-text dark:text-dark-text">{formatDateTime(item.fetchedAt, '未知')}</span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deletingItemId === item.id}
                  className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 transition-opacity cursor-pointer justify-self-start md:justify-self-end disabled:opacity-50"
                >
                  {deletingItemId === item.id ? '删除中...' : '删除'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-6 bg-bg-card dark:bg-dark-bg-card">
            <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">{getEmptyMessage()}</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1 py-8 font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">
            <button
              onClick={() => setItemPage(page => Math.max(1, page - 1))}
              disabled={itemPage <= 1 || itemsLoading}
              className="px-2 py-1 hover:text-accent dark:hover:text-dark-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← 上一页
            </button>
            {getVisiblePages(pagination.page, pagination.totalPages).map((page, index) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1">&middot;&middot;&middot;</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setItemPage(page)}
                  disabled={itemsLoading}
                  className={`px-2.5 py-1 transition-colors cursor-pointer disabled:opacity-50 ${
                    page === pagination.page
                      ? 'text-accent dark:text-dark-accent font-bold'
                      : 'hover:text-accent dark:hover:text-dark-accent'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setItemPage(page => Math.min(pagination.totalPages, page + 1))}
              disabled={itemPage >= pagination.totalPages || itemsLoading}
              className="px-2 py-1 hover:text-accent dark:hover:text-dark-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              下一页 →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
