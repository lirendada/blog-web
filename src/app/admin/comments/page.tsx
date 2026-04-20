'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Comment = {
  id: string
  author: string
  content: string
  createdAt: string
  article: { slug: string; title: string } | null
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/comments')
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条评论？')) return
    await fetch('/api/admin/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setComments((prev) => prev.filter((c) => c.id !== id))
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
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text dark:text-dark-text mb-6">
        评论管理 ({comments.length})
      </h1>

      {comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="
                p-4
                border border-dashed border-border-light dark:border-dark-border-light
                rounded-[var(--radius-md)]
              "
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-heading)] text-sm text-text dark:text-dark-text">
                    {comment.author}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {comment.article && (
                    <Link
                      href={`/articles/${comment.article.slug}`}
                      className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors"
                    >
                      {comment.article.title}
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="font-[family-name:var(--font-mono)] text-xs text-rose dark:text-dark-rose hover:opacity-70 transition-opacity cursor-pointer"
                >
                  删除
                </button>
              </div>
              <p className="font-body text-sm text-text dark:text-dark-text whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary text-center py-12">
          暂无评论
        </p>
      )}
    </div>
  )
}
