import { useState, useEffect } from 'react'
import type { DigestResponse } from '../api/types'
import { fetchDigest } from '../api/client'
import { timeAgo } from '../utils/timeAgo'
import { SkeletonCard } from '../components/SkeletonCard'

export default function Digest() {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily')
  const [digest, setDigest] = useState<DigestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchDigest(period)
      .then(setDigest)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const handleCopy = async () => {
    if (!digest) return
    const text = Object.entries(digest.sections)
      .map(([cat, articles]) =>
        `${cat}:\n${articles.map(a => `  - ${a.title} (${a.source})`).join('\n')}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(`MaschinenPost Digest\n\n${text}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available (HTTP, permission denied, etc.)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/" className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline mb-2 inline-block">&larr; Zurueck</a>
          <h1 className="font-mono font-bold text-2xl tracking-wider dark:text-machine-accent text-gray-900">
            DIGEST
          </h1>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-all ${
                period === p
                  ? 'dark:bg-machine-accent bg-gray-900 dark:text-black text-white dark:border-machine-accent border-gray-900 font-bold'
                  : 'dark:bg-machine-surface bg-white dark:text-machine-text/70 text-gray-600 dark:border-machine-border border-gray-200'
              }`}
            >
              {p === 'daily' ? 'Heute' : 'Woche'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !digest || Object.keys(digest.sections).length === 0 ? (
        <p className="font-mono text-sm dark:text-machine-muted text-gray-500 text-center py-20">
          Keine Artikel im Digest-Zeitraum
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-xs dark:text-machine-text/50 text-gray-400">
              {digest.totalArticles} Artikel gesamt
            </p>
            <button
              onClick={handleCopy}
              className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline inline-flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>

          <div className="space-y-8">
            {Object.entries(digest.sections).map(([category, articles]) => (
              <section key={category}>
                <h2 className="font-mono text-sm font-bold tracking-widest uppercase dark:text-machine-accent text-yellow-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-machine-green" />
                  {category}
                </h2>
                <div className="space-y-3">
                  {articles.map(article => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-sm border dark:border-machine-border border-gray-200 dark:hover:border-machine-accent/30 hover:border-gray-300 transition-colors dark:bg-machine-surface bg-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">
                          {article.language === 'de' ? '\uD83C\uDDE9\uD83C\uDDEA' : '\uD83C\uDDFA\uD83C\uDDF8'}
                        </span>
                        <span className="font-mono text-[11px] dark:text-machine-text/50 text-gray-400">
                          {article.source}
                        </span>
                        <span className="font-mono text-[11px] dark:text-machine-text/40 text-gray-300">
                          {article.publishedAt ? timeAgo(article.publishedAt) : ''}
                        </span>
                      </div>
                      <h3 className="font-sans font-semibold dark:text-white text-gray-900 line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="font-sans text-sm dark:text-machine-text/70 text-gray-500 italic">
                          {article.summary}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
