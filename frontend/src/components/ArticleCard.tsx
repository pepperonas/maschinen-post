import { memo, useCallback } from 'react'
import type { Article } from '../api/types'
import { timeAgo } from '../utils/timeAgo'
import { useSwipe } from '../hooks/useSwipe'

interface ArticleCardProps {
  article: Article
  index?: number
  isBookmarked?: boolean
  isRead?: boolean
  onToggleBookmark?: (id: number) => void
  onMarkRead?: (id: number) => void
  onSelect?: (article: Article) => void
}

const SOURCE_COLORS: Record<string, string> = {
  'Google AI Blog': 'dark:bg-blue-500/20 dark:text-blue-400 bg-blue-100 text-blue-700',
  'OpenAI Blog': 'dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700',
  'The Verge AI': 'dark:bg-purple-500/20 dark:text-purple-400 bg-purple-100 text-purple-700',
  'TechCrunch AI': 'dark:bg-green-500/20 dark:text-green-400 bg-green-100 text-green-700',
  'MIT AI News': 'dark:bg-red-500/20 dark:text-red-400 bg-red-100 text-red-700',
  'heise online': 'dark:bg-orange-500/20 dark:text-orange-400 bg-orange-100 text-orange-700',
  'Golem.de': 'dark:bg-cyan-500/20 dark:text-cyan-400 bg-cyan-100 text-cyan-700',
  't3n': 'dark:bg-rose-500/20 dark:text-rose-400 bg-rose-100 text-rose-700',
}

const SENTIMENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  positiv: { icon: '\u25B2', color: 'text-machine-green', label: 'Positiv' },
  neutral: { icon: '\u25CF', color: 'dark:text-machine-accent text-yellow-600', label: 'Neutral' },
  kritisch: { icon: '\u25BC', color: 'text-red-400', label: 'Kritisch' },
}

function formatSourceBadge(source: string): string {
  return source
    .replace(' Blog', '')
    .replace(' AI', '')
    .replace(' News', '')
    .toUpperCase()
}

function handleShare(article: Article) {
  const shareData = {
    title: article.title,
    text: article.summary || article.title,
    url: article.url,
  }
  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
  } else {
    navigator.clipboard.writeText(article.url).catch(() => {})
  }
}

export const ArticleCard = memo(function ArticleCard({
  article,
  index,
  isBookmarked,
  isRead,
  onToggleBookmark,
  onMarkRead,
  onSelect,
}: ArticleCardProps) {
  const sourceColor =
    SOURCE_COLORS[article.source] ||
    'dark:bg-gray-500/20 dark:text-gray-400 bg-gray-100 text-gray-600'
  const sentiment = article.sentiment
    ? SENTIMENT_CONFIG[article.sentiment]
    : null

  const swipeHandlers = useSwipe({
    onSwipeRight: onToggleBookmark ? () => onToggleBookmark(article.id) : undefined,
    onSwipeLeft: onMarkRead ? () => onMarkRead(article.id) : undefined,
  })

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault()
      onSelect(article)
    }
    onMarkRead?.(article.id)
  }, [article, onSelect, onMarkRead])

  return (
    <article
      className={`dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-4 sm:p-5 glow-border card-hover animate-fade-in flex flex-col overflow-hidden transition-opacity ${isRead ? 'opacity-60' : ''}`}
      data-article-index={index}
      {...swipeHandlers}
    >
      {/* Top: Source + Category + Sentiment */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-sm ${sourceColor}`}
        >
          {formatSourceBadge(article.source)}
        </span>

        {article.category && (
          <span className="font-mono text-xs px-2.5 py-1 rounded-sm dark:bg-machine-accent/15 dark:text-machine-accent bg-yellow-100 text-yellow-800">
            {article.category}
          </span>
        )}

        {sentiment && (
          <span
            className={`ml-auto text-sm ${sentiment.color}`}
            title={sentiment.label}
          >
            {sentiment.icon}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="font-sans font-semibold dark:text-white text-gray-900 line-clamp-2 mb-2 leading-snug dark:hover:text-machine-accent hover:text-yellow-700 transition-colors">
        <a
          href={onSelect ? '#' : article.url}
          target={onSelect ? undefined : '_blank'}
          rel={onSelect ? undefined : 'noopener noreferrer'}
          onClick={handleTitleClick}
        >
          {article.title}
        </a>
      </h2>

      {/* AI Summary or raw content fallback */}
      {(article.summary || article.rawContent) && (
        <p className="font-sans text-sm dark:text-machine-text/80 text-gray-600 italic mb-3 leading-relaxed flex-1">
          {article.summary || article.rawContent}
        </p>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* Footer: flag, source, time + actions */}
      <div className="flex items-center justify-between pt-3 border-t dark:border-machine-border border-gray-100 mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0" title={article.language === 'de' ? 'Deutsch' : 'English'}>
            {article.language === 'de' ? '\uD83C\uDDE9\uD83C\uDDEA' : '\uD83C\uDDFA\uD83C\uDDF8'}
          </span>
          <span className="font-mono text-xs dark:text-machine-text/70 text-gray-500 truncate">
            {article.source}
          </span>
          <span className="font-mono text-xs dark:text-machine-text/50 text-gray-400 shrink-0">
            {article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-0 sm:gap-1 shrink-0 ml-2">
          {/* Bookmark */}
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2.5 sm:p-1 rounded transition-colors ${isBookmarked ? 'dark:text-machine-accent text-yellow-600' : 'dark:text-machine-muted text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700'}`}
              aria-label={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
          {/* Share */}
          <button
            onClick={() => handleShare(article)}
            className="p-2.5 sm:p-1 rounded dark:text-machine-muted text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
            aria-label="Teilen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {/* External link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 sm:p-1 rounded font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline inline-flex items-center gap-0.5"
            onClick={() => onMarkRead?.(article.id)}
          >
            Lesen
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
})
