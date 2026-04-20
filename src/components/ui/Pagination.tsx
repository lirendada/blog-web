'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
  basePath?: string
}

export default function Pagination({ totalPages, currentPage, basePath = '/articles' }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${basePath}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  // Generate page numbers to show
  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <nav
      className="
        flex items-center justify-center gap-1
        font-mono text-sm
        py-8
        text-text-secondary dark:text-dark-text-secondary
      "
    >
      {/* 上一页 */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="
          px-2 py-1
          hover:text-accent dark:hover:text-dark-accent
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors cursor-pointer
        "
      >
        ← 上一页
      </button>

      {/* 页码 */}
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1">
            &middot;&middot;&middot;
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`
              px-2.5 py-1 transition-colors cursor-pointer
              ${
                page === currentPage
                  ? 'text-accent dark:text-dark-accent font-bold'
                  : 'hover:text-accent dark:hover:text-dark-accent'
              }
            `}
          >
            {page}
          </button>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="
          px-2 py-1
          hover:text-accent dark:hover:text-dark-accent
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors cursor-pointer
        "
      >
        下一页 →
      </button>
    </nav>
  )
}
