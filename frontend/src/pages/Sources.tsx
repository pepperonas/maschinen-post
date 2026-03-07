import { useState, useEffect } from 'react'
import type { Feed } from '../api/types'
import { fetchFeeds, reactivateFeed } from '../api/client'
import { timeAgo } from '../utils/timeAgo'

export default function Sources() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeeds()
      .then(setFeeds)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleReactivate = async (id: number) => {
    try {
      const updated = await reactivateFeed(id)
      setFeeds(prev => prev.map(f => f.id === id ? updated : f))
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mb-14">
      <a href="/" className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline mb-2 inline-block">&larr; Zurueck</a>
      <h1 className="font-mono font-bold text-2xl tracking-wider dark:text-machine-accent text-gray-900 mb-6">
        QUELLEN
      </h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 dark:bg-machine-surface bg-gray-100 rounded-sm skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map(feed => {
            const isHealthy = feed.active && feed.failCount === 0
            const isWarning = feed.active && feed.failCount > 0 && feed.failCount < 5
            const isDisabled = !feed.active

            return (
              <div
                key={feed.id}
                className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-4 flex items-center gap-4"
              >
                {/* Health indicator */}
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    isHealthy ? 'bg-machine-green' :
                    isWarning ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  title={isHealthy ? 'Aktiv' : isWarning ? `${feed.failCount} Fehler` : 'Deaktiviert'}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold dark:text-white text-gray-900 truncate">
                      {feed.name}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm dark:bg-machine-border dark:text-machine-text/60 bg-gray-100 text-gray-500">
                      {feed.language?.toUpperCase() || 'EN'}
                    </span>
                  </div>
                  <div className="font-mono text-xs dark:text-machine-text/50 text-gray-400 mt-1 truncate">
                    {feed.url}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {feed.lastFetchedAt && (
                      <span className="font-mono text-[11px] dark:text-machine-text/40 text-gray-300">
                        Letzter Abruf: {timeAgo(feed.lastFetchedAt)}
                      </span>
                    )}
                    {feed.lastError && (
                      <span className="font-mono text-[11px] text-red-400 truncate">
                        {feed.lastError}
                      </span>
                    )}
                  </div>
                </div>

                {isDisabled && (
                  <button
                    onClick={() => handleReactivate(feed.id)}
                    className="font-mono text-xs px-3 py-1.5 border dark:border-machine-accent border-gray-900 dark:text-machine-accent text-gray-900 rounded-sm dark:hover:bg-machine-accent dark:hover:text-black hover:bg-gray-900 hover:text-white transition-colors shrink-0"
                  >
                    Reaktivieren
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
