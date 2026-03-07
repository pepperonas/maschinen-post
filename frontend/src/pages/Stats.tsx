import { useState, useEffect } from 'react'
import type { StatsHistory } from '../api/types'
import { fetchStatsHistory } from '../api/client'

export default function StatsPage() {
  const [data, setData] = useState<StatsHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetchStatsHistory(days)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  const maxSourceCount = data ? Math.max(...Object.values(data.articlesPerSource), 1) : 1
  const totalSentiment = data ? Object.values(data.sentimentDistribution).reduce((a, b) => a + b, 0) : 0

  const SENTIMENT_COLORS: Record<string, string> = {
    positiv: 'bg-machine-green',
    neutral: 'dark:bg-machine-accent bg-yellow-500',
    kritisch: 'bg-red-400',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mb-14">
      <a href="/" className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline mb-2 inline-block">&larr; Zurueck</a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-2xl tracking-wider dark:text-machine-accent text-gray-900">
          STATISTIKEN
        </h1>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-all ${
                days === d
                  ? 'dark:bg-machine-accent bg-gray-900 dark:text-black text-white dark:border-machine-accent border-gray-900 font-bold'
                  : 'dark:bg-machine-surface bg-white dark:text-machine-text/70 text-gray-600 dark:border-machine-border border-gray-200'
              }`}
            >
              {d}T
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 dark:bg-machine-surface bg-gray-100 rounded-sm skeleton-shimmer" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Total */}
          <div className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-5">
            <h2 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-2">
              Gesamt ({days} Tage)
            </h2>
            <p className="font-mono text-3xl font-bold dark:text-machine-accent text-gray-900">
              {data.totalInPeriod}
            </p>
            <p className="font-mono text-xs dark:text-machine-text/50 text-gray-400 mt-1">Artikel</p>
          </div>

          {/* Sentiment donut-like */}
          <div className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-5">
            <h2 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-4">
              Sentiment-Verteilung
            </h2>
            {totalSentiment > 0 && (
              <>
                <div className="flex rounded-sm overflow-hidden h-4 mb-4">
                  {Object.entries(data.sentimentDistribution).map(([key, value]) => (
                    <div
                      key={key}
                      className={`${SENTIMENT_COLORS[key] || 'bg-gray-400'}`}
                      style={{ width: `${(value / totalSentiment) * 100}%` }}
                      title={`${key}: ${value}`}
                    />
                  ))}
                </div>
                <div className="flex gap-4 flex-wrap">
                  {Object.entries(data.sentimentDistribution).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-sm ${SENTIMENT_COLORS[key] || 'bg-gray-400'}`} />
                      <span className="font-mono text-xs dark:text-machine-text/70 text-gray-600">
                        {key}: {value} ({Math.round((value / totalSentiment) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sources bar chart */}
          <div className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-5">
            <h2 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-4">
              Artikel pro Quelle
            </h2>
            <div className="space-y-3">
              {Object.entries(data.articlesPerSource).map(([source, count]) => (
                <div key={source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs dark:text-machine-text/80 text-gray-600 truncate mr-2">
                      {source}
                    </span>
                    <span className="font-mono text-xs font-bold dark:text-machine-accent text-yellow-700 shrink-0">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 dark:bg-machine-bg bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full dark:bg-machine-accent bg-yellow-500 rounded-sm transition-all duration-500"
                      style={{ width: `${(count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="font-mono text-sm dark:text-machine-muted text-gray-500 text-center py-20">
          Statistiken konnten nicht geladen werden
        </p>
      )}
    </div>
  )
}
