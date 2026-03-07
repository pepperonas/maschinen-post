import { useState, useCallback, useEffect } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryFilter } from './components/CategoryFilter'
import { ArticleGrid } from './components/ArticleGrid'
import { NewArticlesBanner } from './components/NewArticlesBanner'
import { Footer } from './components/Footer'
import { Impressum } from './pages/Impressum'
import { Datenschutz } from './pages/Datenschutz'
import { AGB } from './pages/AGB'
import { useArticles } from './hooks/useArticles'
import { useStats } from './hooks/useStats'
import { useTheme } from './hooks/useTheme'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
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

  // Legal pages
  if (hash === '#/impressum') {
    return (
      <div className="min-h-screen industrial-bg font-sans">
        <Header stats={stats} dark={dark} onToggleTheme={toggleTheme} />
        <Impressum />
        <Footer />
      </div>
    )
  }
  if (hash === '#/datenschutz') {
    return (
      <div className="min-h-screen industrial-bg font-sans">
        <Header stats={stats} dark={dark} onToggleTheme={toggleTheme} />
        <Datenschutz />
        <Footer />
      </div>
    )
  }
  if (hash === '#/agb') {
    return (
      <div className="min-h-screen industrial-bg font-sans">
        <Header stats={stats} dark={dark} onToggleTheme={toggleTheme} />
        <AGB />
        <Footer />
      </div>
    )
  }

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
    </div>
  )
}
