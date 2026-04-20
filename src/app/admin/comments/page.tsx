'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import CommentTable from '@/components/admin/CommentTable'

type Comment = {
  id: string
  author: string
  content: string
  status: string
  createdAt: string
  article: { id: string; slug: string; title: string } | null
  _count?: { replies: number }
}

type Stats = { total: number; pending: number; approved: number; rejected: number }

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
]

export default function AdminCommentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-56px-64px)]"><p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary">Loading...</p></div>}>
      <AdminCommentsContent />
    </Suspense>
  )
}

function AdminCommentsContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20', status: statusFilter })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/comments?${params}`)
      const data = await res.json()
      setComments(data.comments || [])
      setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalCount(data.pagination?.total || 0)
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) fetchComments()
    } catch {
      alert('操作失败')
    }
  }

  const handleDelete = () => {
    fetchComments()
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return
    if (action === 'delete' && !confirm(`确定删除选中的 ${selectedIds.length} 条评论？`)) return

    try {
      const res = await fetch('/api/admin/comments/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      })
      if (res.ok) fetchComments()
    } catch {
      alert('操作失败')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (comments.every((c) => selectedIds.includes(c.id))) {
      setSelectedIds([])
    } else {
      setSelectedIds(comments.map((c) => c.id))
    }
  }

  const statCards = [
    { label: '全部评论', value: stats.total, color: 'text-text dark:text-dark-text' },
    { label: '待审核', value: stats.pending, color: 'text-mustard' },
    { label: '已通过', value: stats.approved, color: 'text-accent dark:text-dark-accent' },
    { label: '已拒绝', value: stats.rejected, color: 'text-rose dark:text-dark-rose' },
  ]

  return (
    <div className="max-w-5xl">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text dark:text-dark-text mb-6">
        评论管理
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-card dark:bg-dark-bg-card rounded-[var(--radius-lg)] p-4 shadow-sm"
          >
            <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
              {card.label}
            </p>
            <p className={`font-[family-name:var(--font-mono)] text-2xl ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-dashed border-border-light dark:border-dark-border-light">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1) }}
            className={`font-[family-name:var(--font-mono)] text-sm pb-2 pt-1 cursor-pointer transition-colors border-b-2 -mb-px ${
              statusFilter === tab.key
                ? 'border-accent dark:border-dark-accent text-accent dark:text-dark-accent'
                : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索评论内容或作者..."
            className="
              flex-1 bg-transparent
              border border-dashed border-border-light dark:border-dark-border-light
              rounded-[var(--radius-sm)]
              focus:border-accent dark:focus:border-dark-accent
              focus:outline-none
              font-[family-name:var(--font-mono)] text-sm py-2 px-3
              text-text dark:text-dark-text
              placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary
              transition-colors
            "
          />
          <button
            type="submit"
            className="
              bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover
              text-white font-[family-name:var(--font-mono)] text-sm px-4 py-2
              rounded-[var(--radius-md)]
              transition-colors cursor-pointer
            "
          >
            搜索
          </button>
        </div>
      </form>

      {/* Table */}
      <CommentTable
        comments={comments}
        loading={loading}
        pagination={{ page, pageSize: 20, total: totalCount, totalPages }}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelect={toggleSelect}
        onSelectAll={toggleSelectAll}
        onBulkAction={handleBulkAction}
      />
    </div>
  )
}
