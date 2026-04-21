'use client'

import { useState, useEffect, useCallback } from 'react'

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
  sourceName: string | null
  publishedAt: string | null
}

export default function AdminNewsPage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [fetchResults, setFetchResults] = useState<string[]>([])

  // Add source form
  const [newName, setNewName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newSiteUrl, setNewSiteUrl] = useState('')

  // Add item form
  const [itemTitle, setItemTitle] = useState('')
  const [itemUrl, setItemUrl] = useState('')
  const [itemSourceName, setItemSourceName] = useState('')
  const [itemDescription, setItemDescription] = useState('')

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/news-sources')
      const data = await res.json()
      setSources(data.sources || [])
    } catch (e) { console.error(e) }
  }, [])

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/news-items')
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    Promise.all([loadSources(), loadItems()]).finally(() => setLoading(false))
  }, [loadSources, loadItems])

  const handleAddSource = async () => {
    if (!newName.trim() || !newFeedUrl.trim()) return
    const res = await fetch('/api/admin/news-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), feedUrl: newFeedUrl.trim(), siteUrl: newSiteUrl.trim() }),
    })
    if (res.ok) {
      setNewName('')
      setNewFeedUrl('')
      setNewSiteUrl('')
      loadSources()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to add')
    }
  }

  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`删除「${name}」及其所有资讯？`)) return
    await fetch(`/api/admin/news-sources/${id}`, { method: 'DELETE' })
    loadSources()
    loadItems()
  }

  const handleFetch = async (sourceId?: string) => {
    setFetching(true)
    setFetchResults([])
    try {
      const res = await fetch('/api/admin/fetch-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceId ? { sourceId } : {}),
      })
      const data = await res.json()
      if (data.results) {
        setFetchResults(data.results.map((r: { source: string; fetched: number; skipped?: number; error: string | null }) =>
          r.error ? `${r.source}: Error - ${r.error}` : `${r.source}: ${r.fetched} 条 AI 资讯${r.skipped ? `, 过滤 ${r.skipped} 条` : ''}`
        ))
      }
      loadSources()
      loadItems()
    } catch {
      setFetchResults(['Fetch failed'])
    } finally {
      setFetching(false)
    }
  }

  const handleAddItem = async () => {
    if (!itemTitle.trim() || !itemUrl.trim()) return
    const res = await fetch('/api/admin/news-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: itemTitle.trim(), url: itemUrl.trim(), sourceName: itemSourceName.trim(), description: itemDescription.trim() }),
    })
    if (res.ok) {
      setItemTitle('')
      setItemUrl('')
      setItemSourceName('')
      setItemDescription('')
      loadItems()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to add')
    }
  }

  const handleDeleteItem = async (id: string) => {
    await fetch(`/api/admin/news-items/${id}`, { method: 'DELETE' })
    loadItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px-64px)]">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text dark:text-dark-text">资讯管理</h1>
        <button
          onClick={() => handleFetch()}
          disabled={fetching}
          className="bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover text-white font-[family-name:var(--font-mono)] text-sm px-5 py-1.5 rounded-[var(--radius-md)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {fetching ? '抓取中...' : '抓取全部'}
        </button>
      </div>

      {fetchResults.length > 0 && (
        <div className="mb-4 px-4 py-2 bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent font-[family-name:var(--font-mono)] text-sm rounded-[var(--radius-sm)]">
          {fetchResults.map((r, i) => <div key={i}>{r}</div>)}
        </div>
      )}

      {/* RSS 源管理 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">RSS 源</h2>
        <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-4 bg-bg-card dark:bg-dark-bg-card mb-3">
          <div className="flex flex-wrap gap-2 mb-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名称" className="w-32 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <input value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder="RSS Feed URL" className="flex-1 min-w-[200px] bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <input value={newSiteUrl} onChange={(e) => setNewSiteUrl(e.target.value)} placeholder="网站 URL (可选)" className="w-48 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <button onClick={handleAddSource} className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer">+ 添加</button>
          </div>

          {sources.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center gap-3 py-2 border-b border-dashed border-border-light dark:border-dark-border-light last:border-0">
                  <span className={`shrink-0 inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-[family-name:var(--font-mono)] ${source.active ? 'bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent' : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-secondary dark:text-dark-text-secondary'}`}>
                    {source.type === 'rss' ? 'RSS' : '手动'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-[family-name:var(--font-mono)] text-sm text-text dark:text-dark-text">{source.name}</span>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary ml-2">{source._count.newsItems} 条</span>
                  </div>
                  {source.type === 'rss' && (
                    <button onClick={() => handleFetch(source.id)} disabled={fetching} className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors cursor-pointer disabled:opacity-50">抓取</button>
                  )}
                  <button onClick={() => handleDeleteSource(source.id, source.name)} className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 transition-opacity cursor-pointer">删除</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">暂无 RSS 源</p>
          )}
        </div>
      </section>

      {/* 手动添加资讯 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">手动添加资讯</h2>
        <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-4 bg-bg-card dark:bg-dark-bg-card">
          <div className="flex flex-wrap gap-2">
            <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="标题" className="flex-1 min-w-[200px] bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <input value={itemUrl} onChange={(e) => setItemUrl(e.target.value)} placeholder="URL" className="flex-1 min-w-[200px] bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <input value={itemSourceName} onChange={(e) => setItemSourceName(e.target.value)} placeholder="来源名 (可选)" className="w-36 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <input value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="摘要 (可选)" className="flex-1 min-w-[200px] bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors" />
            <button onClick={handleAddItem} className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer">+ 添加</button>
          </div>
        </div>
      </section>

      {/* 资讯列表 */}
      <section>
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">资讯列表</h2>
        {items.length > 0 ? (
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-dashed border-border-light dark:border-dark-border-light">
                <div className="flex-1 min-w-0">
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
                    {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString('zh-CN')}`}
                  </div>
                </div>
                <button onClick={() => handleDeleteItem(item.id)} className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 transition-opacity cursor-pointer shrink-0">删除</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">暂无资讯</p>
        )}
      </section>
    </div>
  )
}
