import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryFilter } from './components/CategoryFilter'
import { ArticleGrid } from './components/ArticleGrid'
import { NewArticlesBanner } from './components/NewArticlesBanner'
import { Footer } from './components/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ArticleDetailModal } from './components/ArticleDetailModal'
import { TrendingView } from './components/TrendingView'
import { useArticles } from './hooks/useArticles'
import { useStats } from './hooks/useStats'
import { useTheme } from './hooks/useTheme'
import { useBookmarks } from './hooks/useBookmarks'
import { useReadHistory } from './hooks/useReadHistory'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { CATEGORIES } from './api/types'
import type { Article } from './api/types'

const Impressum = lazy(() => import('./pages/Impressum'))
const Datenschutz = lazy(() => import('./pages/Datenschutz'))
const AGB = lazy(() => import('./pages/AGB'))
const Digest = lazy(() => import('./pages/Digest'))
const StatsPage = lazy(() => import('./pages/Stats'))
const Sources = lazy(() => import('./pages/Sources'))

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  const prevRef = useRef(window.location.hash)

  useEffect(() => {
    const update = () => {
      const prev = prevRef.current
      const next = window.location.hash
      if (prev === next) return
      prevRef.current = next
      setHash(next)
      // Only scroll to top for page navigation, not modal open/close
      const isModalTransition = prev.startsWith('#/article/') || next.startsWith('#/article/')
      if (!isModalTransition) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  const [category, setCategory] = useState('Alle')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('maschinenpost-language') || ''
  })
  const { dark, toggle: toggleTheme } = useTheme()
  const { stats, newCount, dismissNew } = useStats()
  const { toggle: toggleBookmark, isBookmarked, count: bookmarkCount } = useBookmarks()
  const { markRead, isRead } = useReadHistory()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const {
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  } = useArticles(category === 'Trending' || category === 'Gespeichert' ? 'Alle' : category, search, language || undefined)

  // Filter bookmarked articles locally
  const displayArticles = category === 'Gespeichert'
    ? articles.filter(a => isBookmarked(a.id))
    : articles

  const handleNewArticles = useCallback(() => {
    dismissNew()
    retry()
  }, [dismissNew, retry])

  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat)
  }, [])

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang)
    localStorage.setItem('maschinenpost-language', lang)
  }, [])

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q)
  }, [])

  const handleSelectArticle = useCallback((article: Article) => {
    setSelectedArticle(article)
    markRead(article.id)
    window.location.hash = `#/article/${article.id}`
  }, [markRead])

  const handleCloseDetail = useCallback(() => {
    setSelectedArticle(null)
    if (window.location.hash.startsWith('#/article/')) {
      history.back()
    }
  }, [])

  // Close modal on browser back button
  useEffect(() => {
    const onPopState = () => {
      if (!window.location.hash.startsWith('#/article/')) {
        setSelectedArticle(null)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleNavigateArticle = useCallback((direction: 'prev' | 'next') => {
    if (!selectedArticle) return
    const idx = displayArticles.findIndex(a => a.id === selectedArticle.id)
    if (idx < 0) return
    const newIdx = direction === 'prev' ? idx - 1 : idx + 1
    if (newIdx >= 0 && newIdx < displayArticles.length) {
      const next = displayArticles[newIdx]
      setSelectedArticle(next)
      markRead(next.id)
      history.replaceState({ articleModal: next.id }, '', `#/article/${next.id}`)
    }
  }, [selectedArticle, displayArticles, markRead])

  // Related articles for detail modal
  const relatedArticles = selectedArticle
    ? displayArticles
        .filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category)
        .slice(0, 3)
    : []

  // Keyboard navigation
  const allCategories = ['Trending', 'Gespeichert', ...CATEGORIES]
  useKeyboardNav({
    articleCount: displayArticles.length,
    onSelectArticle: (idx) => {
      if (displayArticles[idx]) handleSelectArticle(displayArticles[idx])
    },
    onOpenOriginal: (idx) => {
      if (displayArticles[idx]) {
        window.open(displayArticles[idx].url, '_blank')
        markRead(displayArticles[idx].id)
      }
    },
    onToggleBookmark: (idx) => {
      if (displayArticles[idx]) toggleBookmark(displayArticles[idx].id)
    },
    onFocusSearch: () => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    },
    onSetCategory: (idx) => {
      if (idx >= 0 && idx < allCategories.length) {
        setCategory(allCategories[idx])
      }
    },
    enabled: !selectedArticle,
  })

  // Handle deeplink to article
  useEffect(() => {
    const match = hash.match(/^#\/article\/(\d+)$/)
    if (match && !selectedArticle) {
      const id = parseInt(match[1])
      const found = articles.find(a => a.id === id)
      if (found) setSelectedArticle(found)
    }
  }, [hash, articles, selectedArticle])

  // Subpages
  const subPages = ['#/impressum', '#/datenschutz', '#/agb', '#/digest', '#/stats', '#/sources']
  if (subPages.some(p => hash === p)) {
    return (
      <div className="min-h-screen industrial-bg font-sans">
        <Header stats={stats} dark={dark} onToggleTheme={toggleTheme} />
        <ErrorBoundary>
          <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-10" />}>
            {hash === '#/impressum' && <Impressum />}
            {hash === '#/datenschutz' && <Datenschutz />}
            {hash === '#/agb' && <AGB />}
            {hash === '#/digest' && <Digest />}
            {hash === '#/stats' && <StatsPage />}
            {hash === '#/sources' && <Sources />}
          </Suspense>
        </ErrorBoundary>
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
          bookmarkCount={bookmarkCount}
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        {/* Content */}
        <ErrorBoundary>
          {category === 'Trending' ? (
            <TrendingView />
          ) : (
            <ArticleGrid
              articles={displayArticles}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              hasMore={category !== 'Gespeichert' && hasMore}
              onLoadMore={loadMore}
              onRetry={retry}
              isBookmarked={isBookmarked}
              isRead={isRead}
              onToggleBookmark={toggleBookmark}
              onMarkRead={markRead}
              onSelectArticle={handleSelectArticle}
            />
          )}
        </ErrorBoundary>
      </main>

      <Footer />

      {/* Article detail modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={handleCloseDetail}
        onBookmark={toggleBookmark}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
        relatedArticles={relatedArticles}
        onNavigate={handleNavigateArticle}
      />
    </div>
  )
}
