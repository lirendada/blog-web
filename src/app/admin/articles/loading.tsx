export default function AdminArticlesLoading() {
  return (
    <div className="space-y-0">
      {/* Table header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-dashed border-border dark:border-dark-border">
        <div className="h-4 w-8 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        <div className="h-4 w-48 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        <div className="h-4 w-20 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        <div className="h-4 w-16 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        <div className="h-4 w-24 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse ml-auto" />
      </div>

      {/* Table rows skeleton */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-dashed border-border-light dark:border-dark-border-light"
        >
          <div className="h-4 w-8 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-48 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-20 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-16 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-24 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse ml-auto" />
        </div>
      ))}
    </div>
  )
}
