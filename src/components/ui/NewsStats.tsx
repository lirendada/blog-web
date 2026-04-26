'use client'

interface StatItem {
  label: string
  count: number
  color: 'accent' | 'rose' | 'navy'
}

const COLOR_MAP = {
  accent: {
    bg: 'bg-accent-light dark:bg-dark-accent-light',
    text: 'text-accent dark:text-dark-accent',
    dot: 'bg-accent dark:bg-dark-accent',
  },
  rose: {
    bg: 'bg-rose-light dark:bg-dark-rose-light',
    text: 'text-rose dark:text-dark-rose',
    dot: 'bg-rose dark:bg-dark-rose',
  },
  navy: {
    bg: 'bg-bg-secondary dark:bg-dark-bg-secondary',
    text: 'text-navy dark:text-dark-text',
    dot: 'bg-navy dark:bg-dark-text',
  },
}

export default function NewsStats({ stats }: { stats: StatItem[] }) {
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
        资讯统计
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => {
          const colors = COLOR_MAP[s.color]
          return (
            <div
              key={s.label}
              className={`
                rounded-[var(--radius-md)] px-2.5 py-2.5 text-center
                ${colors.bg}
              `}
            >
              <div className={`font-mono text-xl font-medium ${colors.text}`}>
                {s.count}
              </div>
              <div className="font-mono text-[10px] text-text-secondary dark:text-dark-text-secondary mt-0.5 flex items-center justify-center gap-1">
                <span className={`inline-block w-1 h-1 rounded-full ${colors.dot}`} />
                {s.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
