import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

const THRESHOLD = 80

export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startX = useRef(0)
  const startY = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX
    startY.current = e.clientY
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    // Only trigger if horizontal movement is dominant
    if (Math.abs(dx) < THRESHOLD || Math.abs(dy) > Math.abs(dx) * 0.5) return

    if (dx > 0 && onSwipeRight) {
      onSwipeRight()
    } else if (dx < 0 && onSwipeLeft) {
      onSwipeLeft()
    }
  }, [onSwipeLeft, onSwipeRight])

  return { onPointerDown, onPointerUp }
}
