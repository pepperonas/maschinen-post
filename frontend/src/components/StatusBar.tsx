import type { Stats } from '../api/types'
import { timeAgo } from '../utils/timeAgo'

interface StatusBarProps {
  stats: Stats | null
}

export function StatusBar({ stats }: StatusBarProps) {
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
      </div>
    </div>
  )
}
