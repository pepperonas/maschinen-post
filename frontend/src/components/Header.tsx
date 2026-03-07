import type { Stats } from '../api/types'

interface HeaderProps {
  stats: Stats | null
  dark: boolean
  onToggleTheme: () => void
}

export function Header({ stats, dark, onToggleTheme }: HeaderProps) {
  const tickerText =
    '/// MASCHINENPOST — LIVE FEED — KI & ROBOTIK NACHRICHTEN — ECHTZEIT-AGGREGATION — CLAUDE AI POWERED /// '

  return (
    <header className="border-b border-machine-border dark:border-machine-border border-gray-200">
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-mono font-bold text-2xl md:text-3xl tracking-[0.2em] text-machine-accent select-none">
              MASCHINENPOST
            </h1>
            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] dark:text-machine-muted text-gray-500 mt-0.5">
              KI & ROBOTIK NACHRICHTEN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Article counter */}
          {stats && (
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs dark:text-machine-muted text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-machine-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-machine-green"></span>
              </span>
              <span>
                {stats.totalArticles} Artikel verarbeitet
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded dark:text-machine-muted text-gray-500 hover:text-machine-accent transition-colors"
            aria-label={dark ? 'Light Mode' : 'Dark Mode'}
          >
            {dark ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Ticker tape */}
      <div className="ticker-wrap bg-machine-accent/10 dark:bg-machine-accent/10 bg-yellow-50 border-t border-b border-machine-accent/20 py-1">
        <div className="inline-flex animate-ticker">
          <span className="font-mono text-[11px] font-medium text-machine-accent/70 dark:text-machine-accent/70 text-yellow-700/70 px-4">
            {tickerText.repeat(4)}
          </span>
        </div>
      </div>
    </header>
  )
}
