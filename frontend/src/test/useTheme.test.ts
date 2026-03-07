import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '../hooks/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark mode', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.dark).toBe(true)
  })

  it('toggles to light mode', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggle())
    expect(result.current.dark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggle())
    expect(localStorage.getItem('maschinenpost-theme')).toBe('light')
  })

  it('restores light theme from localStorage', () => {
    localStorage.setItem('maschinenpost-theme', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.dark).toBe(false)
  })
})
