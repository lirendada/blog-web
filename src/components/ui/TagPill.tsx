interface TagPillProps {
  name: string
  slug: string
  linked?: boolean
}

export default function TagPill({ name, slug, linked = true }: TagPillProps) {
  const className = `
    inline-block rounded-[var(--radius-sm)] px-2 py-0.5
    font-mono text-xs
    bg-accent-light text-accent
    dark:bg-dark-accent-light dark:text-dark-accent
    hover:opacity-70 transition-opacity
  `

  if (!linked) {
    return <span className={className}>#{name}</span>
  }

  return (
    <a href={`/tags/${slug}`} className={className}>
      #{name}
    </a>
  )
}
