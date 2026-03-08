export function Footer() {
  return (
    <footer className="border-t dark:border-machine-border border-gray-200 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs flex-wrap justify-center">
          <a href="#/digest" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            Digest
          </a>
          <a href="#/stats" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            Statistiken
          </a>
          <a href="#/sources" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            Quellen
          </a>
          <a href="#/impressum" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            Impressum
          </a>
          <a href="#/datenschutz" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            Datenschutz
          </a>
          <a href="#/agb" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors py-1">
            AGB
          </a>
        </div>
        <p className="font-mono text-xs dark:text-machine-text/40 text-gray-400 text-center">
          &copy; 2026 Martin Pfeffer &middot;{' '}
          <a
            href="https://celox.io"
            target="_blank"
            rel="noopener noreferrer"
            className="dark:text-machine-accent text-yellow-700 hover:underline"
          >
            celox.io
          </a>
          {' '}&middot; Powered by Claude AI
        </p>
      </div>
    </footer>
  )
}
