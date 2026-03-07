import { CATEGORIES } from '../api/types'
import type { Stats } from '../api/types'

interface CategoryFilterProps {
  active: string
  onChange: (category: string) => void
  stats: Stats | null
}

export function CategoryFilter({ active, onChange, stats }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat
        const count =
          cat === 'Alle'
            ? stats?.totalArticles
            : stats?.articlesPerCategory[cat]

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              flex-shrink-0 px-3 py-1.5 font-mono text-xs rounded-sm border transition-all
              ${
                isActive
                  ? 'dark:bg-machine-accent bg-gray-900 dark:text-black text-white dark:border-machine-accent border-gray-900 font-bold'
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
