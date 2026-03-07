import { useState, useEffect } from 'react'
import type { TrendingTopic } from '../api/types'
import { fetchTrending } from '../api/client'
import { timeAgo } from '../utils/timeAgo'
import { SkeletonCard } from './SkeletonCard'

export function TrendingView() {
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchTrending(48)
      .then(setTopics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="dark:text-machine-muted text-gray-400 mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p className="font-mono text-sm dark:text-machine-muted text-gray-500">
          Keine Trending-Themen in den letzten 48 Stunden
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {topics.map((topic, idx) => (
        <div
          key={idx}
          className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-4 sm:p-5 glow-border animate-fade-in"
        >
          {/* Topic header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-2.5 py-1 rounded-sm dark:bg-machine-accent/15 dark:text-machine-accent bg-yellow-100 text-yellow-800">
                {topic.category}
              </span>
              <span className="font-mono text-xs font-bold dark:text-machine-green text-green-600">
                {topic.articleCount} Artikel
              </span>
            </div>
            {topic.latestAt && (
              <span className="font-mono text-xs dark:text-machine-text/50 text-gray-400">
                {timeAgo(topic.latestAt)}
              </span>
            )}
          </div>

          {/* Topic title */}
          <h3 className="font-sans font-semibold dark:text-white text-gray-900 mb-3">
            {topic.topic}
          </h3>

          {/* Articles list */}
          <div className="space-y-2">
            {(expanded.has(idx) ? topic.articles : topic.articles.slice(0, 2)).map(article => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-sm border dark:border-machine-border border-gray-100 dark:hover:border-machine-accent/30 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">
                    {article.language === 'de' ? '\uD83C\uDDE9\uD83C\uDDEA' : '\uD83C\uDDFA\uD83C\uDDF8'}
                  </span>
                  <span className="font-mono text-[11px] dark:text-machine-text/50 text-gray-400">
                    {article.source}
                  </span>
                </div>
                <div className="font-sans text-sm dark:text-white text-gray-900 line-clamp-1">
                  {article.title}
                </div>
                {article.summary && (
                  <div className="font-sans text-xs dark:text-machine-text/60 text-gray-500 mt-1 line-clamp-1 italic">
                    {article.summary}
                  </div>
                )}
              </a>
            ))}
          </div>

          {topic.articles.length > 2 && (
            <button
              onClick={() => setExpanded(prev => {
                const next = new Set(prev)
                if (next.has(idx)) next.delete(idx)
                else next.add(idx)
                return next
              })}
              className="mt-2 font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline"
            >
              {expanded.has(idx) ? 'Weniger anzeigen' : `+${topic.articles.length - 2} weitere`}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
