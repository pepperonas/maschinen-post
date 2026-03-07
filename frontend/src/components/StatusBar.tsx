import type { Stats } from '../api/types'
import { timeAgo } from '../utils/timeAgo'
import { refreshFeeds } from '../api/client'
import { useState } from 'react'

interface StatusBarProps {
  stats: Stats | null
}

export function StatusBar({ stats }: StatusBarProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshFeeds()
    } catch {
      // silent
    } finally {
      setTimeout(() => setRefreshing(false), 2000)
    }
  }

  const isRecent =
    stats?.lastUpdate &&
    new Date().getTime() - new Date(stats.lastUpdate).getTime() < 300000

  return (
    <div className="fixed bottom-0 left-0 right-0 dark:bg-machine-bg/95 bg-white/95 backdrop-blur-sm border-t dark:border-machine-border border-gray-200 px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecent && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-machine-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-machine-green"></span>
            </span>
          )}
          <span className="font-mono text-[10px] dark:text-machine-muted text-gray-500">
            {stats?.lastUpdate
              ? `Letzte Aktualisierung: ${timeAgo(stats.lastUpdate)}`
              : 'Warte auf Daten...'}
          </span>
          {stats && (
            <span className="font-mono text-[10px] dark:text-machine-muted/50 text-gray-400 hidden sm:inline">
              | {stats.processedArticles}/{stats.totalArticles} mit KI-Zusammenfassung
            </span>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="font-mono text-[10px] dark:text-machine-muted text-gray-500 hover:text-machine-accent transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={refreshing ? 'animate-spin' : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {refreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
        </button>
      </div>
    </div>
  )
}
