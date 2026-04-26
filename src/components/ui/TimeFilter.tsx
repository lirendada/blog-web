'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { label: '全部', value: '' },
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近7天', value: '7d' },
] as const

export default function TimeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('time') || ''

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('time', value)
    } else {
      params.delete('time')
    }
    params.delete('page')
    router.push(`/news?${params.toString()}`)
  }

  return (
    <div
      className="
        rounded-[var(--radius-lg)]
        bg-bg-card/70 dark:bg-dark-bg-card/40
        border border-dashed border-border-light dark:border-dark-border-light
        p-4
      "
    >
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary mb-3">
        时间筛选
      </h3>
      <div className="flex flex-col gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            className={`
              font-body text-[13px] text-left px-3 py-2 rounded-[var(--radius-md)] cursor-pointer
              transition-all duration-150
              ${
                current === opt.value
                  ? 'bg-accent text-white dark:bg-dark-accent dark:text-dark-bg font-medium shadow-sm'
                  : 'text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text hover:bg-bg-secondary/60 dark:hover:bg-dark-bg-secondary/40'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
