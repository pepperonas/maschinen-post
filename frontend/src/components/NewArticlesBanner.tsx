interface NewArticlesBannerProps {
  count: number
  onLoad: () => void
  onDismiss: () => void
}

export function NewArticlesBanner({
  count,
  onLoad,
  onDismiss,
}: NewArticlesBannerProps) {
  if (count <= 0) return null

  return (
    <div className="bg-machine-accent text-black px-4 py-2 flex items-center justify-center gap-3 animate-fade-in">
      <span className="font-mono text-sm font-bold">
        {count} neue Artikel verfügbar
      </span>
      <button
        onClick={onLoad}
        className="font-mono text-xs font-bold px-3 py-1 bg-black text-machine-accent rounded-sm hover:bg-gray-900 transition-colors"
      >
        Jetzt laden
      </button>
      <button
        onClick={onDismiss}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Schließen"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
