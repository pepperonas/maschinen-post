import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarks } from '../hooks/useBookmarks'

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no bookmarks', () => {
    const { result } = renderHook(() => useBookmarks())
    expect(result.current.count).toBe(0)
    expect(result.current.isBookmarked(1)).toBe(false)
  })

  it('toggles a bookmark on', () => {
    const { result } = renderHook(() => useBookmarks())
    act(() => result.current.toggle(42))
    expect(result.current.isBookmarked(42)).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it('toggles a bookmark off', () => {
    const { result } = renderHook(() => useBookmarks())
    act(() => result.current.toggle(42))
    act(() => result.current.toggle(42))
    expect(result.current.isBookmarked(42)).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('persists bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmarks())
    act(() => result.current.toggle(1))
    act(() => result.current.toggle(2))

    const stored = JSON.parse(localStorage.getItem('maschinenpost-bookmarks')!)
    expect(stored).toContain(1)
    expect(stored).toContain(2)
  })

  it('restores bookmarks from localStorage', () => {
    localStorage.setItem('maschinenpost-bookmarks', JSON.stringify([10, 20]))
    const { result } = renderHook(() => useBookmarks())
    expect(result.current.isBookmarked(10)).toBe(true)
    expect(result.current.isBookmarked(20)).toBe(true)
    expect(result.current.count).toBe(2)
  })
})
