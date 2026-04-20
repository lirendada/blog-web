export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-48 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-32 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-border-light dark:border-dark-border-light" />

        {/* Content lines skeleton */}
        <div className="space-y-4 bg-lined p-4">
          <div className="h-4 w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>

        {/* More lines */}
        <div className="space-y-4 bg-lined p-4">
          <div className="h-4 w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
