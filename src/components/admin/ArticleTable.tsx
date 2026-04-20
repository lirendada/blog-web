'use client'

import Link from 'next/link'

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

type Props = {
  articles: Article[]
  loading: boolean
  pagination: Pagination
  onPageChange: (page: number) => void
  onDelete: (id: string) => void
}

export default function ArticleTable({
  articles,
  loading,
  pagination,
  onPageChange,
  onDelete,
}: Props) {
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除「${title}」吗？此操作不可恢复。`)) return

    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete(id)
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary">
          加载中...
        </p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary">
          暂无文章
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-dashed border-border-light" />

      {articles.map((article) => (
        <div
          key={article.id}
          className="flex items-center justify-between py-3 border-b border-dashed border-border-light"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className={`shrink-0 inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-[family-name:var(--font-mono)] ${
                article.status === 'draft'
                  ? 'bg-rose-light text-rose'
                  : 'bg-accent-light text-accent'
              }`}
            >
              {article.status === 'draft' ? '草稿' : '已发布'}
            </span>
            <span className="text-text text-sm truncate">{article.title}</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            {article.category && (
              <span className="text-xs text-text-secondary font-[family-name:var(--font-mono)] hidden sm:inline">
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
            <button
              onClick={() => handleDelete(article.id, article.title)}
              className="text-xs text-text-secondary hover:text-rose font-[family-name:var(--font-mono)] transition-colors cursor-pointer"
            >
              删除
            </button>
          </div>
        </div>
      ))}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 font-[family-name:var(--font-mono)] text-sm">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            &larr; 上一页
          </button>
          <span className="text-text-secondary">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            下一页 &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
