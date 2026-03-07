import { useState, useEffect, useRef } from 'react'
import type { Stats } from '../api/types'
import { fetchStats } from '../api/client'

export function useStats(pollInterval = 30000) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const previousTotal = useRef<number>(0)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const data = await fetchStats()
        if (!active) return

        if (previousTotal.current > 0 && data.totalArticles > previousTotal.current) {
          setNewCount(data.totalArticles - previousTotal.current)
        }
        previousTotal.current = data.totalArticles

        setStats(data)
      } catch {
        // silent fail for polling
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, pollInterval)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [pollInterval])

  const dismissNew = () => {
    setNewCount(0)
  }

  return { stats, loading, newCount, dismissNew }
}
