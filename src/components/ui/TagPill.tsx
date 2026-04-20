interface TagPillProps {
  name: string
}

export default function TagPill({ name }: TagPillProps) {
  return (
    <span
      className="
        inline-block rounded-[var(--radius-sm)] px-2 py-0.5
        font-mono text-xs
        bg-accent-light text-accent
        dark:bg-dark-accent-light dark:text-dark-accent
      "
    >
      #{name}
    </span>
  )
}
