import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6 py-12 border-2 border-dashed border-border dark:border-dark-border rounded-lg bg-bg-card dark:bg-dark-bg-card">
        <h1 className="text-6xl font-mono text-text dark:text-dark-text mb-4">
          404
        </h1>
        <p className="text-lg text-text-secondary dark:text-dark-text-secondary mb-8">
          页面未找到
        </p>
        <Link
          href="/"
          className="text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover underline underline-offset-4 font-mono"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
