import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [totalArticles, recentArticles] = await Promise.all([
    prisma.article.count(),
    prisma.article.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { name: true } },
        tags: {
          include: { tag: { select: { name: true } } },
        },
      },
    }),
  ])

  const pendingComments = await prisma.comment.count({
    where: { status: 'pending' },
  })

  const draftCount = await prisma.article.count({
    where: { status: 'draft' },
  })
  const publishedCount = await prisma.article.count({
    where: { status: 'published' },
  })

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

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            全部文章
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-text">
            {totalArticles}
          </p>
        </div>
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            已发布
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-accent">
            {publishedCount}
          </p>
        </div>
        <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 shadow-sm">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            草稿
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-rose">
            {draftCount}
          </p>
        </div>
      </div>

      {pendingComments > 0 && (
        <Link
          href="/admin/comments?status=pending"
          className="block bg-mustard/10 border border-dashed border-mustard/30 rounded-[var(--radius-lg)] p-5 mb-10 hover:bg-mustard/20 transition-colors"
        >
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
            待审核评论
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[var(--text-3xl)] text-mustard">
            {pendingComments}
          </p>
        </Link>
      )}

      <div className="border-b border-dashed border-border-light mb-4" />

      <h2 className="font-[family-name:var(--font-heading)] text-[var(--text-xl)] text-text mb-4">
        最近文章
      </h2>

      <div className="space-y-0">
        {recentArticles.map((article) => (
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

      {recentArticles.length === 0 && (
        <p className="text-text-secondary font-[family-name:var(--font-mono)] text-sm py-8 text-center">
          还没有文章，点击右上角开始写吧
        </p>
      )}
    </div>
  )
}
