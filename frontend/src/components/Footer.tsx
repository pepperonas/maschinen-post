export function Footer() {
  return (
    <footer className="border-t dark:border-machine-border border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-xs dark:text-machine-text/60 text-gray-400">
          &copy; 2026 Martin Pfeffer |{' '}
          <a
            href="https://celox.io"
            target="_blank"
            rel="noopener noreferrer"
            className="dark:text-machine-accent text-yellow-700 hover:underline"
          >
            celox.io
          </a>
          <span className="dark:text-machine-text/40 text-gray-300"> | Powered by Claude AI</span>
        </p>
        <div className="flex items-center gap-4 font-mono text-xs">
          <a href="#/impressum" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors">
            Impressum
          </a>
          <a href="#/datenschutz" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors">
            Datenschutz
          </a>
          <a href="#/agb" className="dark:text-machine-text/60 text-gray-400 dark:hover:text-machine-accent hover:text-yellow-700 transition-colors">
            Nutzungsbedingungen
          </a>
        </div>
      </div>
    </footer>
  )
}
