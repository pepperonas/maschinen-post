import { useState, useEffect, useRef, useCallback } from 'react'
import type { Stats } from '../api/types'
import { fetchStats } from '../api/client'

export function useStats(pollInterval = 30000) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const previousTotal = useRef<number>(0)
  const [newCount, setNewCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchStats()

      if (previousTotal.current > 0 && data.totalArticles > previousTotal.current) {
        setNewCount(data.totalArticles - previousTotal.current)
      }
      previousTotal.current = data.totalArticles

      setStats(data)
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(load, pollInterval)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        load()
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [load, pollInterval])

  const dismissNew = () => {
    setNewCount(0)
  }

  return { stats, loading, newCount, dismissNew }
}
