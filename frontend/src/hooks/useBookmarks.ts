import { useState, useCallback } from 'react'

const STORAGE_KEY = 'maschinenpost-bookmarks'

function loadBookmarks(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch { /* ignore */ }
  return new Set()
}

function saveBookmarks(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<number>>(loadBookmarks)

  const toggle = useCallback((id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveBookmarks(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: number) => bookmarks.has(id), [bookmarks])

  const count = bookmarks.size

  return { bookmarks, toggle, isBookmarked, count }
}
