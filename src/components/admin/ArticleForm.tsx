'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Category = {
  id: string
  name: string
  slug: string
}

type ArticleData = {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  status: string
  categoryId: string
  tags: string[]
} | null

type Props = {
  initialData: ArticleData
}

export default function ArticleForm({ initialData }: Props) {
  const router = useRouter()
  const isEditMode = !!initialData?.id

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [status, setStatus] = useState(initialData?.status || 'draft')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      const hasChinese = /[\u4e00-\u9fff]/.test(title)
      if (hasChinese) {
        const timestamp = Date.now().toString(36)
        setSlug(`post-${timestamp}`)
      } else {
        setSlug(
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        )
      }
    }
  }, [title, slugManuallyEdited])

  // Debounced markdown preview
  const updatePreview = useCallback(async (markdown: string) => {
    try {
      const res = await fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown }),
      })
      const data = await res.json()
      setPreviewHtml(data.html || '')
    } catch {
      setPreviewHtml('')
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updatePreview(content)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content, updatePreview])

  // Initial preview
  useEffect(() => {
    if (content) {
      updatePreview(content)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt,
      coverImage,
      status,
      categoryId: categoryId || null,
      tags,
    }

    try {
      let res: Response
      if (isEditMode) {
        res = await fetch(`/api/admin/articles/${initialData!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Save failed')
        return
      }

      router.push('/admin/articles')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px-64px)]">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-dashed border-border-light dark:border-dark-border-light bg-bg-card dark:bg-dark-bg-card shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          className="flex-1 text-[var(--text-2xl)] font-[family-name:var(--font-heading)] bg-transparent border-0 focus:outline-none text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-bg-secondary dark:bg-dark-bg-secondary border border-dashed border-border dark:border-dark-border rounded-[var(--radius-sm)] font-[family-name:var(--font-mono)] text-sm px-3 py-1.5 text-text dark:text-dark-text focus:outline-none focus:border-accent dark:focus:border-dark-accent cursor-pointer"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover text-white font-[family-name:var(--font-mono)] text-sm px-5 py-1.5 rounded-[var(--radius-md)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="px-6 py-2 bg-rose-light dark:bg-dark-rose-light text-rose dark:text-dark-rose font-[family-name:var(--font-mono)] text-sm">
          {error}
        </div>
      )}

      {/* Editor + Preview Two-Column Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Monaco Editor */}
        <div className="flex-1 min-w-0 border-r border-dashed border-border-light dark:border-dark-border-light">
          <MonacoEditor
            height="100%"
            language="markdown"
            theme="notebook"
            value={content}
            onChange={(value) => setContent(value || '')}
            options={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              renderLineHighlight: 'none',
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme('notebook', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#fdfcfa',
                  'editor.foreground': '#4a4540',
                  'editor.lineHighlightBackground': '#f1eee8',
                  'editorLineNumber.foreground': '#8a8580',
                  'editor.selectionBackground': '#e8ede5',
                  'editorCursor.foreground': '#7d9070',
                },
              })
            }}
          />
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6 bg-bg dark:bg-dark-bg">
          {previewHtml ? (
            <div
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <p className="text-text-secondary dark:text-dark-text-secondary font-[family-name:var(--font-mono)] text-sm">
              Preview will appear here...
            </p>
          )}
        </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="border-t border-dashed border-border-light dark:border-dark-border-light bg-bg-card dark:bg-dark-bg-card px-6 py-4 shrink-0">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {/* Slug */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              className="flex-1 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text transition-colors"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <label className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text cursor-pointer transition-colors"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
              Cover
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Image URL..."
              className="flex-1 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
            />
          </div>

          {/* Excerpt */}
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <label className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
              Excerpt
            </label>
            <div className="flex-1 relative">
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description..."
                maxLength={300}
                className="w-full bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
              />
              <span className="absolute right-0 -bottom-4 font-[family-name:var(--font-mono)] text-[10px] text-text-secondary dark:text-dark-text-secondary">
                {excerpt.length}/300
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 min-w-[250px]">
            <label className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent font-[family-name:var(--font-mono)] text-xs px-2 py-0.5 rounded-[var(--radius-full)]"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose dark:hover:text-dark-rose transition-colors cursor-pointer"
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                className="bg-transparent border-0 focus:outline-none font-[family-name:var(--font-mono)] text-xs py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
