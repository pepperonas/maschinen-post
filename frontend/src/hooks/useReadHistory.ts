import { useState, useCallback } from 'react'

const STORAGE_KEY = 'maschinenpost-read'
const MAX_ENTRIES = 500

function loadRead(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch { /* ignore */ }
  return new Set()
}

function saveRead(ids: Set<number>) {
  // Keep only the last MAX_ENTRIES
  const arr = [...ids]
  if (arr.length > MAX_ENTRIES) {
    const trimmed = arr.slice(arr.length - MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
}

export function useReadHistory() {
  const [readIds, setReadIds] = useState<Set<number>>(loadRead)

  const markRead = useCallback((id: number) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveRead(next)
      return next
    })
  }, [])

  const isRead = useCallback((id: number) => readIds.has(id), [readIds])

  return { readIds, markRead, isRead }
}
