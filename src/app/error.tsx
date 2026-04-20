'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6 py-12 border-2 border-dashed border-border dark:border-dark-border rounded-lg bg-bg-card dark:bg-dark-bg-card">
        <h1 className="text-4xl font-mono text-text dark:text-dark-text mb-4">
          出错了
        </h1>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
          {error.message || '发生了意外错误'}
        </p>
        {error.digest && (
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-6 font-mono">
            错误代码: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 px-6 py-2 bg-accent dark:bg-dark-accent text-white rounded-md text-sm hover:bg-accent-hover dark:hover:bg-dark-accent-hover transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  )
}
