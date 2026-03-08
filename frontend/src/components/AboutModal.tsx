import { useEffect } from 'react'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-y-auto dark:bg-machine-surface bg-white border-t sm:border dark:border-machine-border border-gray-200 rounded-t-xl sm:rounded-sm shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 dark:bg-machine-surface bg-white border-b dark:border-machine-border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="font-mono font-bold text-lg tracking-wider dark:text-machine-accent text-gray-900">
            MASCHINENPOST
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-1.5 rounded dark:text-machine-muted text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors"
            aria-label="Schliessen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-sm dark:bg-machine-green/15 dark:text-machine-green bg-green-100 text-green-700">
              Open Source
            </span>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-sm dark:bg-machine-accent/15 dark:text-machine-accent bg-yellow-100 text-yellow-800">
              MIT Lizenz
            </span>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-sm dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 text-blue-700">
              2026
            </span>
          </div>

          {/* Developer */}
          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-2">
              Entwickler
            </h3>
            <p className="font-sans dark:text-white text-gray-900 font-medium">
              Martin Pfeffer
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://celox.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline inline-flex items-center gap-1"
              >
                celox.io
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
              <a
                href="https://github.com/pepperonas/maschinen-post"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs dark:text-machine-accent text-yellow-700 hover:underline inline-flex items-center gap-1"
              >
                GitHub
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t dark:border-machine-border border-gray-200" />

          {/* About the app */}
          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-2">
              Die App
            </h3>
            <p className="font-sans text-sm dark:text-machine-text/90 text-gray-600 leading-relaxed">
              MaschinenPost ist ein deutschsprachiger Nachrichten-Aggregator
              rund um KI, Robotik und Technologie. Die App sammelt automatisch
              Artikel aus 10 kuratierten RSS-Feeds (7 englisch, 3 deutsch) und
              verarbeitet sie mit Claude AI zu deutschen Zusammenfassungen,
              Tags, Kategorien und Sentiment-Einordnungen.
            </p>
            <p className="font-sans text-sm dark:text-machine-text/90 text-gray-600 leading-relaxed mt-3">
              Das Backend (Spring Boot) fetcht alle 12 Stunden neue Artikel und
              dedupliziert sie per SHA-256 URL-Hash und Content-Similarity.
              Das Frontend (React) zeigt die Ergebnisse mit Infinite Scroll,
              Suche, Kategorie-Filter und Sprachfilter (DE/EN).
            </p>
          </div>

          {/* Divider */}
          <div className="border-t dark:border-machine-border border-gray-200" />

          {/* Features */}
          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-3">
              Funktionen
            </h3>
            <div className="space-y-2">
              {[
                ['Sprachfilter', 'Umschalten zwischen deutschen, englischen oder allen Artikeln'],
                ['Lesezeichen', 'Artikel lokal speichern und im Tab "Gespeichert" abrufen'],
                ['Trending', 'KI-basiertes Clustering erkennt aktuelle Trendthemen'],
                ['Tages-Digest', 'Kuratierte Zusammenfassung der Top-Artikel pro Kategorie'],
                ['Statistiken', 'Dashboard mit Quellen-Verteilung und Sentiment-Analyse'],
                ['Quellen-Monitor', 'Feed-Health mit automatischer Deaktivierung nach Fehlern'],
                ['RSS-Feed', 'Eigener RSS-Feed zum Abonnieren in externen Readern'],
                ['Duplikat-Erkennung', 'Trigram- und Tag-Similarity verhindert doppelte Artikel'],
                ['PWA', 'Installierbar als App auf Desktop und Mobilgeraeten'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-2">
                  <span className="shrink-0 mt-1 w-1 h-1 rounded-full dark:bg-machine-accent bg-gray-900" />
                  <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                    <span className="dark:text-white text-gray-900 font-medium">{title}</span>
                    {' \u2014 '}
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t dark:border-machine-border border-gray-200" />

          {/* Card anatomy */}
          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-3">
              Aufbau der Artikel-Cards
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-sm dark:bg-cyan-500/20 dark:text-cyan-400 bg-cyan-100 text-cyan-700">
                  QUELLE
                </span>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  Farbcodiertes Badge zeigt die Nachrichtenquelle (heise, t3n, Golem, TechCrunch, etc.)
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 font-mono text-[11px] px-2 py-0.5 rounded-sm dark:bg-machine-accent/15 dark:text-machine-accent bg-yellow-100 text-yellow-800">
                  Kategorie
                </span>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  Von Claude AI zugeordnet: KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware oder Tools
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-machine-green text-sm" title="Positiv">{'\u25B2'}</span>
                  <span className="dark:text-machine-accent text-yellow-600 text-sm" title="Neutral">{'\u25CF'}</span>
                  <span className="text-red-400 text-sm" title="Kritisch">{'\u25BC'}</span>
                </div>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  Sentiment-Indikator — positiv, neutral oder kritisch, ebenfalls von der KI bewertet
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 font-sans text-sm dark:text-machine-text/80 text-gray-500 italic">
                  Abc...
                </span>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  Deutsche Zusammenfassung des Artikels in 2-3 Sätzen, generiert von Claude AI (Haiku)
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 font-mono text-[11px] px-2 py-0.5 dark:bg-machine-border dark:text-machine-text/60 bg-gray-100 text-gray-500 rounded-sm">
                  Tag
                </span>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  3-5 Schlagwörter, die den Inhalt des Artikels erfassen
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 font-mono text-[11px] uppercase px-1.5 py-0.5 rounded dark:bg-machine-border dark:text-machine-text/60 bg-gray-100 text-gray-500">
                  DE / EN
                </span>
                <p className="font-sans text-sm dark:text-machine-text/80 text-gray-500">
                  Sprache des Original-Artikels — die Zusammenfassung ist immer auf Deutsch
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="border-t dark:border-machine-border border-gray-200 pt-5">
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-3">
              Tastatur-Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ['j / k', 'Naechster / Voriger'],
                ['Enter', 'Detail oeffnen'],
                ['o', 'Original oeffnen'],
                ['b', 'Lesezeichen'],
                ['s / /', 'Suche'],
                ['Esc', 'Schliessen'],
                ['1-8', 'Kategorie'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="font-mono text-[10px] px-1.5 py-0.5 dark:bg-machine-border dark:text-machine-text/80 bg-gray-100 text-gray-600 rounded">
                    {key}
                  </kbd>
                  <span className="font-sans text-xs dark:text-machine-text/60 text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="border-t dark:border-machine-border border-gray-200 pt-5">
            <h3 className="font-mono text-xs tracking-widest uppercase dark:text-machine-muted text-gray-400 mb-2">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['Spring Boot', 'React', 'TypeScript', 'Tailwind CSS', 'Claude AI', 'PostgreSQL', 'Vite', 'Nginx'].map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] px-2 py-0.5 dark:bg-machine-border dark:text-machine-text/60 bg-gray-100 text-gray-500 rounded-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
