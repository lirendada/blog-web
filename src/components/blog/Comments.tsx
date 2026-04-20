'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

type Comment = {
  id: string
  author: string
  content: string
  createdAt: string
  parentId?: string | null
  replies?: Comment[]
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
  const [success, setSuccess] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

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
    setSuccess('')

    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim(), content: content.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '提交失败')
        return
      }

      setSuccess(data.message || '评论已提交，等待审核')
      setContent('')
      setTimeout(() => setSuccess(''), 5000)
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyTo || !replyContent.trim()) return
    setReplyLoading(true)

    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim() || '匿名',
          content: replyContent.trim(),
          parentId: replyTo.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '回复失败')
        return
      }

      setSuccess(data.message || '回复已提交，等待审核')
      setReplyTo(null)
      setReplyContent('')
      setTimeout(() => setSuccess(''), 5000)
    } catch {
      setError('网络错误')
    } finally {
      setReplyLoading(false)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={isReply ? 'ml-6 pl-4 border-l-2 border-accent/20 dark:border-dark-accent/20' : ''}
    >
      <div
        className={`
          p-4
          border border-dashed border-border-light dark:border-dark-border-light
          rounded-[var(--radius-md)]
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-heading text-sm text-text dark:text-dark-text">
            {comment.author}
          </span>
          <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
            {formatDate(new Date(comment.createdAt))}
          </span>
          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
              className="font-mono text-xs text-accent dark:text-dark-accent hover:opacity-70 transition-opacity cursor-pointer ml-auto"
            >
              回复
            </button>
          )}
        </div>
        <p className="font-body text-sm text-text dark:text-dark-text whitespace-pre-wrap">
          {comment.content}
        </p>

        {replyTo?.id === comment.id && (
          <form onSubmit={handleReply} className="mt-3 pt-3 border-t border-dashed border-border-light dark:border-dark-border-light">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`回复 ${comment.author}...`}
              required
              maxLength={2000}
              rows={2}
              className="
                w-full bg-transparent
                border border-dashed border-border-light dark:border-dark-border-light
                rounded-[var(--radius-sm)]
                focus:border-accent dark:focus:border-dark-accent
                focus:outline-none resize-y
                font-body text-sm py-2 px-3
                text-text dark:text-dark-text
                placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary
                transition-colors
              "
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setReplyTo(null); setReplyContent('') }}
                className="font-mono text-xs text-text-secondary hover:text-text px-3 py-1.5 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={replyLoading || !replyContent.trim()}
                className="
                  bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover
                  text-white font-mono text-xs px-4 py-1.5
                  rounded-[var(--radius-sm)]
                  transition-colors disabled:opacity-50 cursor-pointer
                "
              >
                {replyLoading ? '...' : '回复'}
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  )

  return (
    <div className="mt-12 pt-8 border-t border-dashed border-border-light dark:border-dark-border-light">
      <h2 className="font-heading text-xl text-text dark:text-dark-text mb-6">
        评论 ({comments.length})
      </h2>

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
        {success && (
          <p className="font-mono text-xs text-accent dark:text-dark-accent mt-2">{success}</p>
        )}
      </form>

      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary text-center py-8">
          暂无评论，来说两句吧
        </p>
      )}
    </div>
  )
}
