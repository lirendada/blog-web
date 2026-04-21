'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { fetcher } from '@/lib/fetcher'

interface DashboardData {
  totalArticles: number
  recentArticles: {
    id: string
    title: string
    status: string
    updatedAt: string
    category: { name: string } | null
  }[]
  totalViews: number
  pendingComments: number
  draftCount: number
  publishedCount: number
}

export default function AdminDashboard() {
  const { data, isLoading } = useSWR<DashboardData>('/api/admin/dashboard', fetcher, {
    dedupingInterval: 120000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl">
        <div className="font-[family-name:var(--font-mono)] text-sm text-text-secondary py-12 text-center">
          加载中...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-[var(--text-3xl)] text-text">
          管理总览
        </h1>
        <Link
          href="/admin/articles/new"
          className="bg-accent hover:bg-accent-hover text-white font-[family-name:var(--font-mono)] text-sm px-5 py-2 rounded-[var(--radius-md)] transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            全部文章
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-text">
            {data.totalArticles}
          </p>
        </div>
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            已发布
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-accent">
            {data.publishedCount}
          </p>
        </div>
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            草稿
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-rose">
            {data.draftCount}
          </p>
        </div>
        <Link
          href="/admin/stats"
          className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            总浏览量
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-accent">
            {data.totalViews.toLocaleString()}
          </p>
        </Link>
      </div>

      {data.pendingComments > 0 && (
        <Link
          href="/admin/comments?status=pending"
          className="block bg-mustard/10 border border-dashed border-mustard/30 rounded-[var(--radius-lg)] p-5 mb-10 hover:bg-mustard/20 transition-colors"
        >
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            待审核评论
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-mustard">
            {data.pendingComments}
          </p>
        </Link>
      )}

      <div className="border-b border-dashed border-border-light mb-4" />

      <h2 className="font-[family-name:var(--font-heading)] text-[var(--text-xl)] text-text mb-4">
        最近文章
      </h2>

      <div className="space-y-0">
        {data.recentArticles.map((article) => (
          <div
            key={article.id}
            className="flex items-center justify-between py-3 border-b border-dashed border-border-light"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className={`inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-[family-name:var(--font-mono)] ${
                  article.status === 'draft'
                    ? 'bg-rose-light text-rose'
                    : 'bg-accent-light text-accent'
                }`}
              >
                {article.status === 'draft' ? '草稿' : '已发布'}
              </span>
              <span className="text-text text-sm truncate">
                {article.title}
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {article.category && (
                <span className="text-xs text-text-secondary font-[family-name:var(--font-mono)]">
                  {article.category.name}
                </span>
              )}
              <span className="text-xs text-text-secondary font-[family-name:var(--font-mono)]">
                {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
              </span>
              <Link
                href={`/admin/articles/${article.id}/edit`}
                className="text-xs text-navy hover:text-accent font-[family-name:var(--font-mono)] transition-colors"
              >
                编辑
              </Link>
            </div>
          </div>
        ))}
      </div>

      {data.recentArticles.length === 0 && (
        <p className="text-text-secondary font-[family-name:var(--font-mono)] text-sm py-8 text-center">
          还没有文章，点击右上角开始写吧
        </p>
      )}
    </div>
  )
}
