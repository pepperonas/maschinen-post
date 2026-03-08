import { CATEGORIES } from '../api/types'
import type { Stats } from '../api/types'

interface CategoryFilterProps {
  active: string
  onChange: (category: string) => void
  stats: Stats | null
  bookmarkCount?: number
  language?: string
  onLanguageChange?: (lang: string) => void
}

const EXTRA_TABS = ['Trending', 'Gespeichert'] as const

const LANG_OPTIONS = [
  { value: '', label: 'Alle', flag: '' },
  { value: 'de', label: 'DE', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { value: 'en', label: 'EN', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
] as const

export function CategoryFilter({ active, onChange, stats, bookmarkCount = 0, language = '', onLanguageChange }: CategoryFilterProps) {
  const allTabs = [...EXTRA_TABS, ...CATEGORIES]

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6">
      {/* Language toggle */}
      {onLanguageChange && (
        <div className="flex items-center shrink-0 mr-1 border-r dark:border-machine-border border-gray-200 pr-3">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onLanguageChange(opt.value)}
              className={`
                px-3 sm:px-2 py-2 sm:py-1.5 font-mono text-xs transition-all first:rounded-l-sm last:rounded-r-sm border-y border-r first:border-l
                ${language === opt.value
                  ? 'dark:bg-machine-accent bg-gray-900 dark:text-black text-white dark:border-machine-accent border-gray-900 font-bold'
                  : 'dark:bg-machine-surface bg-white dark:text-machine-text/70 text-gray-600 dark:border-machine-border border-gray-200 dark:hover:text-machine-accent hover:text-gray-900'
                }
              `}
              aria-label={`Sprache: ${opt.label}`}
            >
              {opt.flag ? `${opt.flag}` : opt.label}
            </button>
          ))}
        </div>
      )}
      {allTabs.map((cat) => {
        const isActive = active === cat
        let count: number | undefined

        if (cat === 'Alle') {
          count = stats?.totalArticles
        } else if (cat === 'Gespeichert') {
          count = bookmarkCount > 0 ? bookmarkCount : undefined
        } else if (cat === 'Trending') {
          count = undefined
        } else {
          count = stats?.articlesPerCategory[cat]
        }

        const isSpecial = cat === 'Trending' || cat === 'Gespeichert'

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              flex-shrink-0 px-3 py-2 sm:py-1.5 font-mono text-xs rounded-sm border transition-all
              ${
                isActive
                  ? 'dark:bg-machine-accent bg-gray-900 dark:text-black text-white dark:border-machine-accent border-gray-900 font-bold'
                  : isSpecial
                    ? 'dark:bg-machine-green/10 bg-green-50 dark:text-machine-green text-green-700 dark:border-machine-green/30 border-green-200 dark:hover:border-machine-green hover:border-green-400'
                    : 'dark:bg-machine-surface bg-white dark:text-machine-text/70 text-gray-600 dark:border-machine-border border-gray-200 dark:hover:border-machine-accent hover:border-gray-900 dark:hover:text-machine-accent hover:text-gray-900'
              }
            `}
          >
            {cat}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1.5 ${isActive ? 'text-black/60' : 'dark:text-machine-text/50 text-gray-400'}`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
