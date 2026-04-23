import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="
        py-8 text-center
        border-t border-dashed border-border-light dark:border-dark-border-light
        font-mono text-xs text-text-secondary dark:text-dark-text-secondary
      "
    >
      <nav className="flex items-center justify-center gap-3 mb-3">
        <Link
          href="/articles"
          className="hover:text-accent dark:hover:text-dark-accent transition-colors"
        >
          博客
        </Link>
        <span className="text-border dark:text-dark-border">&middot;</span>
        <Link
          href="/feed.xml"
          className="hover:text-accent dark:hover:text-dark-accent transition-colors"
        >
          RSS
        </Link>
        <span className="text-border dark:text-dark-border">&middot;</span>
        <a
          href="https://github.com/lirendada"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent dark:hover:text-dark-accent transition-colors"
        >
          GitHub
        </a>
      </nav>
      <p>用爱发电 &copy; {new Date().getFullYear()}</p>
    </footer>
  )
}
