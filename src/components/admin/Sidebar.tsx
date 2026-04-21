'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export default function Sidebar() {
  const { data } = useSWR<{ pendingCount: number }>(
    '/api/admin/comments/pending-count',
    fetcher,
    { dedupingInterval: 60000 },
  )

  const pendingCount = data?.pendingCount ?? 0

  return (
    <aside className="w-[240px] shrink-0 bg-bg-card border-r border-dashed border-border-light p-6 flex flex-col">
      <h2 className="font-[family-name:var(--font-mono)] text-lg text-text mb-6">
        管理手帐
      </h2>

      <nav className="flex flex-col gap-1 flex-1">
        <Link
          href="/admin"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 总览
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/articles"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 文章
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/about"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 关于页面
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/news"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 资讯管理
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/comments"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors flex items-center gap-2"
        >
          <span>○ 评论管理</span>
          {pendingCount > 0 && (
            <span className="bg-mustard text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {pendingCount}
            </span>
          )}
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/stats"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 统计
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/admin/settings"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors"
        >
          ○ 设置
        </Link>

        <div className="border-b border-dashed border-border-light my-2" />

        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent py-2 px-3 rounded-[var(--radius-sm)] transition-colors mt-auto"
        >
          &larr; 返回首页
        </Link>
      </nav>

      <div className="border-t border-dashed border-border-light pt-4 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-rose py-2 px-3 transition-colors cursor-pointer w-full text-left"
        >
          退出登录
        </button>
      </div>
    </aside>
  )
}
