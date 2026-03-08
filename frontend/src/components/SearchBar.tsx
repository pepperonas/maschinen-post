import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (v: string) => {
    setLocal(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(v), 300)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-machine-muted text-gray-400 pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Artikel durchsuchen..."
        className="w-full pl-10 pr-10 py-2.5 font-mono text-sm
          dark:bg-machine-surface bg-white
          dark:text-machine-text text-gray-900
          dark:border-machine-border border-gray-200
          border rounded-sm
          dark:placeholder:text-machine-text/40 placeholder:text-gray-400
          focus:outline-none focus:border-machine-accent
          transition-colors"
      />

      {/* Clear button */}
      {local && (
        <button
          onClick={() => {
            setLocal('')
            onChange('')
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 dark:text-machine-muted text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
