import Link from 'next/link'

interface TagPillProps {
  name: string
  slug: string
}

export default function TagPill({ name, slug }: TagPillProps) {
  return (
    <Link
      href={`/tags/${slug}`}
      className="
        inline-block rounded-[var(--radius-sm)] px-2 py-0.5
        font-mono text-xs
        bg-accent-light text-accent
        dark:bg-dark-accent-light dark:text-dark-accent
        hover:opacity-70 transition-opacity
      "
    >
      #{name}
    </Link>
  )
}
