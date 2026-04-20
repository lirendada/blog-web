'use client'

import Link from 'next/link'

type Comment = {
  id: string
  author: string
  content: string
  status: string
  createdAt: string
  article: { id: string; slug: string; title: string } | null
  _count?: { replies: number }
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type Props = {
  comments: Comment[]
  loading: boolean
  pagination: Pagination
  onPageChange: (page: number) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  selectedIds: string[]
  onSelect: (id: string) => void
  onSelectAll: () => void
  onBulkAction: (action: string) => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待审核', className: 'bg-mustard/10 text-mustard' },
  approved: { label: '已通过', className: 'bg-accent-light text-accent' },
  rejected: { label: '已拒绝', className: 'bg-rose-light text-rose' },
}

export default function CommentTable({
  comments,
  loading,
  pagination,
  onPageChange,
  onStatusChange,
  onDelete,
  selectedIds,
  onSelect,
  onSelectAll,
  onBulkAction,
}: Props) {
  const allSelected =
    comments.length > 0 && comments.every((c) => selectedIds.includes(c.id))

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条评论？')) return
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) onDelete(id)
      else alert('删除失败')
    } catch {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">
          加载中...
        </p>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">
          暂无评论
        </p>
      </div>
    )
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-accent/5 dark:bg-dark-accent/5 rounded-[var(--radius-md)] border border-dashed border-accent/20 dark:border-dark-accent/20">
          <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
            已选 {selectedIds.length} 条
          </span>
          <button
            onClick={() => onBulkAction('approve')}
            className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:opacity-70 cursor-pointer"
          >
            批量通过
          </button>
          <button
            onClick={() => onBulkAction('reject')}
            className="font-[family-name:var(--font-mono)] text-xs text-mustard hover:opacity-70 cursor-pointer"
          >
            批量拒绝
          </button>
          <button
            onClick={() => onBulkAction('delete')}
            className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 cursor-pointer"
          >
            批量删除
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 py-2 border-b border-dashed border-border-light dark:border-dark-border-light">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onSelectAll}
          className="cursor-pointer accent-accent"
        />
        <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary flex-1">
          全选
        </span>
      </div>

      {comments.map((comment) => {
        const config = statusConfig[comment.status] || statusConfig.pending
        return (
          <div
            key={comment.id}
            className="flex items-start gap-3 py-3 border-b border-dashed border-border-light dark:border-dark-border-light"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(comment.id)}
              onChange={() => onSelect(comment.id)}
              className="mt-1 cursor-pointer accent-accent"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`shrink-0 inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-[family-name:var(--font-mono)] ${config.className}`}
                >
                  {config.label}
                </span>
                <span className="font-[family-name:var(--font-heading)] text-sm text-text dark:text-dark-text">
                  {comment.author}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                </span>
                {comment._count && comment._count.replies > 0 && (
                  <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                    {comment._count.replies} 条回复
                  </span>
                )}
                {comment.article && (
                  <Link
                    href={`/articles/${comment.article.slug}`}
                    className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:opacity-70 transition-opacity truncate max-w-[200px]"
                  >
                    {comment.article.title}
                  </Link>
                )}
              </div>
              <p className="font-body text-sm text-text dark:text-dark-text whitespace-pre-wrap line-clamp-2">
                {comment.content}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {comment.status === 'pending' && (
                <>
                  <button
                    onClick={() => onStatusChange(comment.id, 'approved')}
                    className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:opacity-70 cursor-pointer"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => onStatusChange(comment.id, 'rejected')}
                    className="font-[family-name:var(--font-mono)] text-xs text-mustard hover:opacity-70 cursor-pointer"
                  >
                    拒绝
                  </button>
                </>
              )}
              {comment.status === 'approved' && (
                <button
                  onClick={() => onStatusChange(comment.id, 'rejected')}
                  className="font-[family-name:var(--font-mono)] text-xs text-mustard hover:opacity-70 cursor-pointer"
                >
                  拒绝
                </button>
              )}
              {comment.status === 'rejected' && (
                <button
                  onClick={() => onStatusChange(comment.id, 'approved')}
                  className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:opacity-70 cursor-pointer"
                >
                  通过
                </button>
              )}
              <button
                onClick={() => handleDelete(comment.id)}
                className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 cursor-pointer"
              >
                删除
              </button>
            </div>
          </div>
        )
      })}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 font-[family-name:var(--font-mono)] text-sm">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            &larr; 上一页
          </button>
          <span className="text-text-secondary dark:text-dark-text-secondary">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            下一页 &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
