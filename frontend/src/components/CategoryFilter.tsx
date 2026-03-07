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
                  ? 'bg-machine-accent text-black border-machine-accent font-bold'
                  : 'dark:bg-machine-surface bg-white dark:text-machine-muted text-gray-600 dark:border-machine-border border-gray-200 hover:border-machine-accent hover:text-machine-accent'
              }
            `}
          >
            {cat}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1.5 ${isActive ? 'text-black/60' : 'dark:text-machine-muted/60 text-gray-400'}`}
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
