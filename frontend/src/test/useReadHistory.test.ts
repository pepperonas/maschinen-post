import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useReadHistory } from '../hooks/useReadHistory'

describe('useReadHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no read articles', () => {
    const { result } = renderHook(() => useReadHistory())
    expect(result.current.isRead(1)).toBe(false)
  })

  it('marks an article as read', () => {
    const { result } = renderHook(() => useReadHistory())
    act(() => result.current.markRead(5))
    expect(result.current.isRead(5)).toBe(true)
  })

  it('does not duplicate entries when marking the same article twice', () => {
    const { result } = renderHook(() => useReadHistory())
    act(() => result.current.markRead(5))
    act(() => result.current.markRead(5))

    const stored = JSON.parse(localStorage.getItem('maschinenpost-read')!)
    expect(stored.filter((id: number) => id === 5)).toHaveLength(1)
  })

  it('persists read history to localStorage', () => {
    const { result } = renderHook(() => useReadHistory())
    act(() => result.current.markRead(1))
    act(() => result.current.markRead(2))

    const stored = JSON.parse(localStorage.getItem('maschinenpost-read')!)
    expect(stored).toContain(1)
    expect(stored).toContain(2)
  })

  it('restores read history from localStorage', () => {
    localStorage.setItem('maschinenpost-read', JSON.stringify([10, 20]))
    const { result } = renderHook(() => useReadHistory())
    expect(result.current.isRead(10)).toBe(true)
    expect(result.current.isRead(20)).toBe(true)
  })
})
