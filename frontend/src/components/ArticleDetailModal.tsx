import { useEffect } from 'react'
import type { Article } from '../api/types'
import { timeAgo } from '../utils/timeAgo'

interface ArticleDetailModalProps {
  article: Article | null
  onClose: () => void
  onBookmark?: (id: number) => void
  isBookmarked?: boolean
  relatedArticles?: Article[]
  onNavigate?: (direction: 'prev' | 'next') => void
}

const SENTIMENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  positiv: { icon: '\u25B2', color: 'text-machine-green', label: 'Positiv' },
  neutral: { icon: '\u25CF', color: 'dark:text-machine-accent text-yellow-600', label: 'Neutral' },
  kritisch: { icon: '\u25BC', color: 'text-red-400', label: 'Kritisch' },
}

export function ArticleDetailModal({
  article,
  onClose,
  onBookmark,
  isBookmarked,
  relatedArticles = [],
  onNavigate,
}: ArticleDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!article) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [article])

  useEffect(() => {
    if (!article) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate('prev')
      if (e.key === 'ArrowRight' && onNavigate) onNavigate('next')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [article, onClose, onNavigate])

  if (!article) return null

  const sentiment = article.sentiment ? SENTIMENT_CONFIG[article.sentiment] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      data-modal
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none" />

      <div
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain dark:bg-machine-surface bg-white border-t sm:border dark:border-machine-border border-gray-200 rounded-t-xl sm:rounded-sm shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 dark:bg-machine-surface bg-white border-b dark:border-machine-border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {article.language === 'de' ? '\uD83C\uDDE9\uD83C\uDDEA' : '\uD83C\uDDFA\uD83C\uDDF8'}
            </span>
            <span className="font-mono text-xs dark:text-machine-text/70 text-gray-500">
              {article.source}
            </span>
          </div>
          <div className="flex items-center gap-0 sm:gap-2">
            {onBookmark && (
              <button
                onClick={() => onBookmark(article.id)}
                className={`p-2.5 sm:p-1.5 rounded transition-colors ${isBookmarked ? 'dark:text-machine-accent text-yellow-600' : 'dark:text-machine-muted text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700'}`}
                aria-label={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
            {onNavigate && (
              <>
                <button onClick={() => onNavigate('prev')} className="p-2.5 sm:p-1.5 rounded dark:text-machine-muted text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors" aria-label="Voriger Artikel">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button onClick={() => onNavigate('next')} className="p-2.5 sm:p-1.5 rounded dark:text-machine-muted text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors" aria-label="Naechster Artikel">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2.5 sm:p-1.5 rounded dark:text-machine-muted text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors"
              aria-label="Schliessen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          {/* Category + Sentiment */}
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <span className="font-mono text-xs px-2.5 py-1 rounded-sm dark:bg-machine-accent/15 dark:text-machine-accent bg-yellow-100 text-yellow-800">
                {article.category}
              </span>
            )}
            {sentiment && (
              <span className={`text-sm ${sentiment.color}`} title={sentiment.label}>
                {sentiment.icon} {sentiment.label}
              </span>
            )}
            <span className="font-mono text-xs dark:text-machine-text/50 text-gray-400">
              {article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-sans font-bold text-xl dark:text-white text-gray-900 leading-snug">
            {article.title}
          </h2>

          {/* Summary */}
          {article.summary && (
            <p className="font-sans text-base dark:text-machine-text/90 text-gray-600 leading-relaxed italic">
              {article.summary}
            </p>
          )}

          {/* Raw content fallback */}
          {!article.summary && article.rawContent && (
            <p className="font-sans text-sm dark:text-machine-text/70 text-gray-500 leading-relaxed">
              {article.rawContent}
            </p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[11px] px-2 py-0.5 dark:bg-machine-border dark:text-machine-text/60 bg-gray-100 text-gray-500 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Open original */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2 border dark:border-machine-accent border-gray-900 dark:text-machine-accent text-gray-900 dark:hover:bg-machine-accent dark:hover:text-black hover:bg-gray-900 hover:text-white rounded-sm transition-colors"
          >
            Originalquelle
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </a>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <>
              <div className="border-t dark:border-machine-border border-gray-200 pt-4">
                <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-3">
                  Verwandte Artikel
                </h3>
                <div className="space-y-2">
                  {relatedArticles.map(related => (
                    <a
                      key={related.id}
                      href={related.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-sm border dark:border-machine-border border-gray-100 dark:hover:border-machine-accent/30 hover:border-gray-300 transition-colors"
                    >
                      <div className="font-sans text-sm dark:text-white text-gray-900 line-clamp-1">
                        {related.title}
                      </div>
                      <div className="font-mono text-xs dark:text-machine-text/50 text-gray-400 mt-1">
                        {related.source} &middot; {related.publishedAt ? timeAgo(related.publishedAt) : ''}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
