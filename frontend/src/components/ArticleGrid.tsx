import { useEffect, useRef } from 'react'
import type { Article } from '../api/types'
import { ArticleCard } from './ArticleCard'
import { SkeletonCard } from './SkeletonCard'

interface ArticleGridProps {
  articles: Article[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onRetry: () => void
}

export function ArticleGrid({
  articles,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onRetry,
}: ArticleGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="dark:text-machine-muted text-gray-400 mb-4"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-mono text-sm dark:text-machine-muted text-gray-500 mb-4">
          Fehler: {error}
        </p>
        <button
          onClick={onRetry}
          className="font-mono text-sm px-4 py-2 border dark:border-machine-accent border-gray-900 dark:text-machine-accent text-gray-900 dark:hover:bg-machine-accent dark:hover:text-black hover:bg-gray-900 hover:text-white rounded-sm transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="dark:text-machine-muted text-gray-400 mb-4"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="font-mono text-sm dark:text-machine-muted text-gray-500">
          Keine Artikel gefunden
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {loadingMore &&
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
      </div>

      {hasMore && <LoadMoreTrigger loading={loadingMore} onLoadMore={onLoadMore} />}
    </div>
  )
}

function LoadMoreTrigger({ loading, onLoadMore }: { loading: boolean; onLoadMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || loading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, onLoadMore])

  return (
    <div ref={ref} className="flex justify-center mt-8 py-4">
      {loading && (
        <span className="font-mono text-sm dark:text-machine-muted text-gray-500 animate-pulse">
          Laden...
        </span>
      )}
    </div>
  )
}
