import { useState } from 'react'
import type { Stats } from '../api/types'
import { timeAgo } from '../utils/timeAgo'
import { AboutModal } from './AboutModal'

interface HeaderProps {
  stats: Stats | null
  dark: boolean
  onToggleTheme: () => void
}

export function Header({ stats, dark, onToggleTheme }: HeaderProps) {
  const [aboutOpen, setAboutOpen] = useState(false)
  const tickerText =
    '/// MASCHINENPOST — LIVE FEED — KI & ROBOTIK NACHRICHTEN — ECHTZEIT-AGGREGATION — CLAUDE AI POWERED /// '

  return (
    <>
    <header className="border-b border-machine-border dark:border-machine-border border-gray-200 overflow-hidden">
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-mono font-bold text-xl sm:text-2xl md:text-3xl tracking-[0.08em] sm:tracking-[0.2em] dark:text-machine-accent text-gray-900 select-none">
              MASCHINENPOST
            </h1>
            <p className="font-mono text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.3em] dark:text-machine-text/60 text-gray-500 mt-0.5">
              KI & ROBOTIK NACHRICHTEN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Article counter + last update */}
          {stats && (
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs dark:text-machine-text/70 text-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-machine-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-machine-green"></span>
              </span>
              <span>
                {stats.totalArticles} Artikel
              </span>
              {stats.lastUpdate && (
                <span className="dark:text-machine-muted text-gray-500">
                  | aktualisiert {timeAgo(stats.lastUpdate)}
                </span>
              )}
            </div>
          )}

          {/* RSS Feed */}
          <a
            href="/api/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded dark:text-machine-muted text-gray-500 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
            aria-label="RSS Feed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
            </svg>
          </a>

          {/* GitHub link */}
          <a
            href="https://github.com/pepperonas/maschinen-post"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded dark:text-machine-muted text-gray-500 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
            aria-label="GitHub Repository"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>

          {/* About */}
          <button
            onClick={() => setAboutOpen(true)}
            className="p-2 rounded dark:text-machine-muted text-gray-500 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
            aria-label="Über die App"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded dark:text-machine-muted text-gray-500 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
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
          <span className="font-mono text-[11px] font-medium dark:text-machine-accent/70 text-yellow-700/70 px-4">
            {tickerText.repeat(4)}
          </span>
        </div>
      </div>
    </header>

    <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}
