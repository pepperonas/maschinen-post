export function Footer() {
  return (
    <footer className="border-t dark:border-machine-border border-gray-200 py-6 mb-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-[11px] dark:text-machine-muted text-gray-400">
          &copy; 2026 Martin Pfeffer |{' '}
          <a
            href="https://celox.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-machine-accent hover:underline"
          >
            celox.io
          </a>
        </p>
        <p className="font-mono text-[10px] dark:text-machine-muted/50 text-gray-300">
          Powered by Claude AI
        </p>
      </div>
    </footer>
  )
}
