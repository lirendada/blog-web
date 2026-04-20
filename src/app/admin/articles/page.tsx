'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ArticleTable from '@/components/admin/ArticleTable'

type Article = {
  id: string
  title: string
  slug: string
  status: string
  updatedAt: string
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string; slug: string }[]
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchArticles = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (status !== 'all') params.set('status', status)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchArticles(1)
  }

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'published', label: '已发布' },
    { key: 'draft', label: '草稿' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-[var(--text-3xl)] text-text">
          文章管理
        </h1>
        <Link
          href="/admin/articles/new"
          className="bg-accent hover:bg-accent-hover text-white font-[family-name:var(--font-mono)] text-sm px-5 py-2 rounded-[var(--radius-md)] transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`font-[family-name:var(--font-mono)] text-sm px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                status === tab.key
                  ? 'bg-accent-light text-accent'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章..."
            className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-2 px-1 text-text placeholder:text-text-secondary transition-colors"
          />
        </form>
      </div>

      <ArticleTable
        articles={articles}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchArticles(page)}
        onDelete={(id) => {
          setArticles((prev) => prev.filter((a) => a.id !== id))
        }}
      />
    </div>
  )
}
