import type { Article } from '../api/types'
import { timeAgo } from '../utils/timeAgo'

interface ArticleCardProps {
  article: Article
}

const SOURCE_COLORS: Record<string, string> = {
  'Google AI Blog': 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400',
  'OpenAI Blog': 'bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-400',
  'The Verge AI': 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400',
  'TechCrunch AI': 'bg-green-500/20 text-green-400 dark:bg-green-500/20 dark:text-green-400',
  'MIT AI News': 'bg-red-500/20 text-red-400 dark:bg-red-500/20 dark:text-red-400',
}

const SENTIMENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  positiv: { icon: '\u25B2', color: 'text-machine-green', label: 'Positiv' },
  neutral: { icon: '\u25CF', color: 'text-machine-accent', label: 'Neutral' },
  kritisch: { icon: '\u25BC', color: 'text-red-400', label: 'Kritisch' },
}

function formatSourceBadge(source: string): string {
  return source
    .replace(' Blog', '')
    .replace(' AI', '')
    .replace(' News', '')
    .toUpperCase()
}

export function ArticleCard({ article }: ArticleCardProps) {
  const sourceColor =
    SOURCE_COLORS[article.source] ||
    'bg-gray-500/20 text-gray-400 dark:bg-gray-500/20 dark:text-gray-400'
  const sentiment = article.sentiment
    ? SENTIMENT_CONFIG[article.sentiment]
    : null

  return (
    <article className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-5 glow-border card-hover animate-fade-in flex flex-col">
      {/* Top: Source + Category + Sentiment */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm ${sourceColor}`}
        >
          {formatSourceBadge(article.source)}
        </span>

        {article.category && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-machine-accent/15 text-machine-accent">
            {article.category}
          </span>
        )}

        {sentiment && (
          <span
            className={`ml-auto text-xs ${sentiment.color}`}
            title={sentiment.label}
          >
            {sentiment.icon}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="font-sans font-semibold dark:text-white text-gray-900 line-clamp-2 mb-2 leading-snug hover:text-machine-accent transition-colors">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h2>

      {/* AI Summary */}
      <p className="font-sans text-sm dark:text-machine-text/80 text-gray-600 italic line-clamp-3 mb-3 leading-relaxed flex-1">
        {article.summary || (
          <span className="dark:text-machine-muted text-gray-400 not-italic">
            Zusammenfassung wird generiert...
          </span>
        )}
      </p>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-1.5 py-0.5 dark:bg-machine-border dark:text-machine-muted bg-gray-100 text-gray-500 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: time + link */}
      <div className="flex items-center justify-between pt-2 border-t dark:border-machine-border border-gray-100">
        <span className="font-mono text-[10px] dark:text-machine-muted text-gray-400">
          {article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-machine-accent hover:underline inline-flex items-center gap-1"
        >
          Original lesen
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </article>
  )
}
