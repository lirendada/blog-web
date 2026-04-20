export default function ArticleLoading() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Title skeleton */}
        <div className="h-10 w-3/4 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />

        {/* Meta skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-20 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-16 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-border-light dark:border-dark-border-light" />

        {/* Content skeleton - article shaped */}
        <div className="space-y-5 bg-lined p-6">
          <div className="h-4 w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>

        <div className="space-y-5 bg-lined p-6">
          <div className="h-4 w-3/4 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-bg-secondary dark:bg-dark-bg-secondary rounded animate-pulse" />
        </div>
      </div>
    </article>
  )
}
