export interface ArticleWithRelations {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: 'draft' | 'published'
  publishedAt: Date | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  category: { id: string; name: string; slug: string } | null
  tags: { tag: { id: string; name: string; slug: string } }[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
