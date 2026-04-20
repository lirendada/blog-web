import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="
        py-6 text-center
        border-t border-dashed border-border-light dark:border-dark-border-light
        font-mono text-xs text-text-secondary dark:text-dark-text-secondary
      "
    >
      <p>
        用爱发电 &copy; 2025 &middot;{' '}
        <Link
          href="/feed.xml"
          className="hover:text-accent dark:hover:text-dark-accent transition-colors"
        >
          RSS
        </Link>{' '}
        &middot;{' '}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent dark:hover:text-dark-accent transition-colors"
        >
          GitHub
        </a>
      </p>
    </footer>
  )
}
