'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import EmojiPicker from '@/components/ui/EmojiPicker'

function insertAtCursor(
  setter: React.Dispatch<React.SetStateAction<string>>,
  ref: React.RefObject<HTMLTextAreaElement | null>,
  emoji: string
) {
  const el = ref.current
  if (!el) {
    setter((v) => v + emoji)
    return
  }
  const start = el.selectionStart
  const end = el.selectionEnd
  setter((v) => v.slice(0, start) + emoji + v.slice(end))
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + emoji.length
    el.focus()
  })
}

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
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

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
        className="
          p-4
          bg-bg-card dark:bg-dark-bg-card
          rounded-lg
          shadow-sm
          border-2 border-transparent
          hover:shadow-md
          hover:border-dashed hover:border-accent/20 dark:hover:border-dark-accent/20
          transition-all
        "
      >
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="
              rounded-full px-2.5 py-0.5
              text-xs font-medium font-mono
              bg-accent-light dark:bg-dark-accent-light
              text-accent dark:text-dark-accent
            "
          >
            {comment.author}
          </span>
        </div>

        {/* Content */}
        <p className="font-body text-sm text-text dark:text-dark-text whitespace-pre-wrap mb-3">
          {comment.content}
        </p>

        {/* Stats bar */}
        <div
          className="
            flex items-center justify-between
            pt-2 border-t border-dashed border-border-light dark:border-dark-border-light
            text-text-secondary dark:text-dark-text-secondary
          "
        >
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M12 8V12L15 15" />
              <circle strokeWidth={2} r={9} cy={12} cx={12} />
            </svg>
            {formatDate(new Date(comment.createdAt))}
          </div>
          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
              className="
                flex items-center gap-1 font-mono text-xs
                text-accent dark:text-dark-accent
                hover:opacity-70 transition-opacity cursor-pointer
              "
            >
              <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={1.5} d="M12 10H12.01M8 10H8.01M16 10H16.01M3 10C3 4.64706 5.11765 3 12 3C18.8824 3 21 4.64706 21 10C21 15.3529 18.8824 17 12 17C11.6592 17 11.3301 16.996 11.0124 16.9876L7 21V16.4939C4.0328 15.6692 3 13.7383 3 10Z" />
              </svg>
              回复
            </button>
          )}
        </div>

        {replyTo?.id === comment.id && (
          <form onSubmit={handleReply} className="mt-3 pt-3 border-t border-dashed border-border-light dark:border-dark-border-light">
            <textarea
              ref={replyRef}
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
              <EmojiPicker onSelect={(e) => insertAtCursor(setReplyContent, replyRef, e)} />
              <button
                type="button"
                onClick={() => { setReplyTo(null); setReplyContent('') }}
                className="font-mono text-xs text-text-secondary hover:text-text dark:hover:text-dark-text px-3 py-1.5 cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={replyLoading || !replyContent.trim()}
                className="
                  bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover
                  text-white font-mono text-xs px-4 py-1.5
                  rounded-full
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

      {comments.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {comments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary text-center py-8 mb-8">
          暂无评论，来说两句吧
        </p>
      )}

      {/* Comment form */}
      <div className="max-w-[520px] mx-auto mb-4 text-center">
        <p className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
          &#8595; 分享你的观点
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-[520px] mx-auto">
        <div
          className="
            p-4
            bg-bg-card dark:bg-dark-bg-card
            rounded-lg
            shadow-sm
            flex flex-col gap-3
          "
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
              你的名字
            </span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
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
                transition-colors
              "
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
              评论内容
            </span>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
                transition-colors
              "
            />
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <EmojiPicker onSelect={(e) => insertAtCursor(setContent, contentRef, e)} />
              <span className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary">
                {content.length}/2000
              </span>
            </div>
            <button
              type="submit"
              disabled={loading || !author.trim() || !content.trim()}
              className="
                bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover
                text-white font-mono text-sm px-5 py-2
                rounded-full
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
    </div>
  )
}
