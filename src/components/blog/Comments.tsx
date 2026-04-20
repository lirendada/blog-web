'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

type Comment = {
  id: string
  author: string
  content: string
  createdAt: string
}

interface CommentsProps {
  slug: string
}

export default function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/articles/${slug}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim(), content: content.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to post')
        return
      }

      const data = await res.json()
      setComments((prev) => [data.comment, ...prev])
      setContent('')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-dashed border-border-light dark:border-dark-border-light">
      <h2 className="font-heading text-xl text-text dark:text-dark-text mb-6">
        评论 ({comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="你的名字"
            required
            maxLength={50}
            className="
              w-full bg-transparent
              border border-dashed border-border-light dark:border-dark-border-light
              rounded-[var(--radius-sm)]
              focus:border-accent dark:focus:border-dark-accent
              focus:outline-none
              font-mono text-sm py-2.5 px-3
              text-text dark:text-dark-text
              placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary
              transition-colors
            "
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写点什么呢..."
            required
            maxLength={2000}
            rows={3}
            className="
              w-full bg-transparent
              border border-dashed border-border-light dark:border-dark-border-light
              rounded-[var(--radius-sm)]
              focus:border-accent dark:focus:border-dark-accent
              focus:outline-none resize-y
              font-body text-sm py-2.5 px-3
              text-text dark:text-dark-text
              placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary
              transition-colors
            "
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={loading || !author.trim() || !content.trim()}
              className="
                bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover
                text-white font-mono text-sm px-5 py-2
                rounded-[var(--radius-md)]
                transition-colors disabled:opacity-50 cursor-pointer
              "
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>
        {error && (
          <p className="font-mono text-xs text-rose dark:text-dark-rose mt-2">{error}</p>
        )}
      </form>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="
                p-4
                border border-dashed border-border-light dark:border-dark-border-light
                rounded-[var(--radius-md)]
              "
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-heading text-sm text-text dark:text-dark-text">
                  {comment.author}
                </span>
                <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="font-body text-sm text-text dark:text-dark-text whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary text-center py-8">
          暂无评论，来说两句吧
        </p>
      )}
    </div>
  )
}
