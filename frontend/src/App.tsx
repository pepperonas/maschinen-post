import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryFilter } from './components/CategoryFilter'
import { ArticleGrid } from './components/ArticleGrid'
import { NewArticlesBanner } from './components/NewArticlesBanner'
import { StatusBar } from './components/StatusBar'
import { Footer } from './components/Footer'
import { useArticles } from './hooks/useArticles'
import { useStats } from './hooks/useStats'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [category, setCategory] = useState('Alle')
  const [search, setSearch] = useState('')
  const { dark, toggle: toggleTheme } = useTheme()
  const { stats, newCount, dismissNew } = useStats()

  const {
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  } = useArticles(category, search)

  const handleNewArticles = useCallback(() => {
    dismissNew()
    retry()
  }, [dismissNew, retry])

  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat)
  }, [])

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q)
  }, [])

  return (
    <div className="min-h-screen industrial-bg font-sans">
      <Header stats={stats} dark={dark} onToggleTheme={toggleTheme} />
      <NewArticlesBanner
        count={newCount}
        onLoad={handleNewArticles}
        onDismiss={dismissNew}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="mb-4">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>

        {/* Category filter */}
        <CategoryFilter
          active={category}
          onChange={handleCategoryChange}
          stats={stats}
        />

        {/* Article grid */}
        <ArticleGrid
          articles={articles}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={retry}
        />
      </main>

      <Footer />
      <StatusBar stats={stats} />
    </div>
  )
}
