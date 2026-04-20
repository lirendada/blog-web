'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'

type Tag = {
  id: string
  name: string
  slug: string
}

type Category = {
  id: string
  name: string
  slug: string
}

type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  status: string
  categoryId: string | null
  category: Category | null
  tags: Tag[]
}

export default function EditArticlePage() {
  const params = useParams()
  const id = params.id as string
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found')
        return res.json()
      })
      .then((data) => setArticle(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">
          Loading...
        </p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="font-[family-name:var(--font-mono)] text-sm text-rose dark:text-dark-rose">
          {error || 'Article not found'}
        </p>
      </div>
    )
  }

  return (
    <ArticleForm
      initialData={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || '',
        coverImage: article.coverImage || '',
        status: article.status,
        categoryId: article.categoryId || '',
        tags: article.tags.map((t) => t.name),
      }}
    />
  )
}
