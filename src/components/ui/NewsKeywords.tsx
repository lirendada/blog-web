'use client'

interface NewsKeywordsProps {
  keywords: { word: string; count: number }[]
}

const PALETTE = [
  'bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent',
  'bg-rose-light dark:bg-dark-rose-light text-rose dark:text-dark-rose',
  'bg-bg-secondary dark:bg-dark-bg-secondary text-navy dark:text-dark-text',
  'bg-accent-light/60 dark:bg-dark-accent-light/60 text-accent-hover dark:text-dark-accent-hover',
  'bg-rose-light/60 dark:bg-dark-rose-light/60 text-rose dark:text-dark-rose',
]

export default function NewsKeywords({ keywords }: NewsKeywordsProps) {
  if (keywords.length === 0) return null

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
        热门关键词
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((kw, i) => (
          <span
            key={kw.word}
            className={`
              font-mono text-[11px] px-2 py-0.5
              rounded-[var(--radius-sm)]
              ${PALETTE[i % PALETTE.length]}
            `}
          >
            {kw.word}
          </span>
        ))}
      </div>
    </div>
  )
}
