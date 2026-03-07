import { useState, useEffect, useCallback, useRef } from 'react'
import type { Article } from '../api/types'
import { fetchArticles } from '../api/client'

interface UseArticlesOptions {
  size?: number
  sort?: string
}

export function useArticles(
  category: string,
  search: string,
  options: UseArticlesOptions = {},
) {
  const { size = 20, sort = 'published' } = options
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const loadArticles = useCallback(
    async (pageNum: number, append: boolean) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const data = await fetchArticles({
          page: pageNum,
          size,
          category,
          search,
          sort,
        })

        if (controller.signal.aborted) return

        if (append) {
          setArticles((prev) => [...prev, ...data.content])
        } else {
          setArticles(data.content)
        }
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
        setPage(data.number)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Fehler beim Laden')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [category, search, size, sort],
  )

  useEffect(() => {
    loadArticles(0, false)
    return () => abortRef.current?.abort()
  }, [loadArticles])

  const loadMore = useCallback(() => {
    if (page + 1 < totalPages && !loadingMore) {
      loadArticles(page + 1, true)
    }
  }, [page, totalPages, loadingMore, loadArticles])

  const retry = useCallback(() => {
    loadArticles(0, false)
  }, [loadArticles])

  return {
    articles,
    loading,
    loadingMore,
    error,
    page,
    totalPages,
    totalElements,
    hasMore: page + 1 < totalPages,
    loadMore,
    retry,
  }
}
