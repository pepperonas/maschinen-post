import { useEffect, useCallback, useRef } from 'react'

interface UseKeyboardNavOptions {
  articleCount: number
  onSelectArticle: (index: number) => void
  onOpenOriginal: (index: number) => void
  onToggleBookmark: (index: number) => void
  onFocusSearch: () => void
  onSetCategory: (index: number) => void
  enabled: boolean
}

export function useKeyboardNav({
  articleCount,
  onSelectArticle,
  onOpenOriginal,
  onToggleBookmark,
  onFocusSearch,
  onSetCategory,
  enabled,
}: UseKeyboardNavOptions) {
  const focusedIndex = useRef(-1)

  const setFocused = useCallback((index: number) => {
    focusedIndex.current = index
    // Update visual focus
    const cards = document.querySelectorAll('[data-article-index]')
    cards.forEach(card => card.classList.remove('keyboard-focus'))
    if (index >= 0 && index < cards.length) {
      const card = cards[index]
      card.classList.add('keyboard-focus')
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Don't intercept when typing in input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          target.blur()
          e.preventDefault()
        }
        return
      }

      // Don't intercept when modal is open
      if (document.querySelector('[data-modal]')) return

      switch (e.key) {
        case 'j': {
          e.preventDefault()
          const next = Math.min(focusedIndex.current + 1, articleCount - 1)
          setFocused(next)
          break
        }
        case 'k': {
          e.preventDefault()
          const prev = Math.max(focusedIndex.current - 1, 0)
          setFocused(prev)
          break
        }
        case 'Enter': {
          if (focusedIndex.current >= 0) {
            e.preventDefault()
            onSelectArticle(focusedIndex.current)
          }
          break
        }
        case 'o': {
          if (focusedIndex.current >= 0) {
            e.preventDefault()
            onOpenOriginal(focusedIndex.current)
          }
          break
        }
        case 'b': {
          if (focusedIndex.current >= 0) {
            e.preventDefault()
            onToggleBookmark(focusedIndex.current)
          }
          break
        }
        case 's':
        case '/': {
          e.preventDefault()
          onFocusSearch()
          break
        }
        case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': {
          e.preventDefault()
          onSetCategory(parseInt(e.key) - 1)
          setFocused(-1)
          break
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, articleCount, onSelectArticle, onOpenOriginal, onToggleBookmark, onFocusSearch, onSetCategory, setFocused])

  return { focusedIndex: focusedIndex.current, setFocused }
}
