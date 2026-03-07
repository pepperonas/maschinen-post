import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg
            className="dark:text-machine-muted text-gray-400 mb-4"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-mono text-sm dark:text-machine-muted text-gray-500 mb-2">
            Etwas ist schiefgelaufen
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="font-mono text-sm px-4 py-2 border dark:border-machine-accent border-gray-900 dark:text-machine-accent text-gray-900 dark:hover:bg-machine-accent dark:hover:text-black hover:bg-gray-900 hover:text-white rounded-sm transition-colors mb-3"
          >
            Erneut versuchen
          </button>
          <button
            onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
            className="font-mono text-xs dark:text-machine-muted text-gray-400 hover:underline"
          >
            {this.state.showDetails ? 'Details ausblenden' : 'Details anzeigen'}
          </button>
          {this.state.showDetails && this.state.error && (
            <pre className="mt-3 p-3 rounded-sm dark:bg-machine-bg bg-gray-100 font-mono text-xs dark:text-machine-text/60 text-gray-500 max-w-lg overflow-x-auto">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
