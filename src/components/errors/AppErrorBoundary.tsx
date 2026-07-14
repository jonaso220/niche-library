import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface State { hasError: boolean }

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="min-h-screen bg-background text-text-primary grid place-items-center px-6">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-danger mx-auto" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Algo salió mal</h1>
          <p className="text-sm text-text-secondary">Tus datos siguen guardados. Recarga la aplicación para continuar.</p>
          <a href="/" className="inline-flex px-5 py-2.5 rounded-xl bg-gold text-background font-semibold">Volver al inicio</a>
        </div>
      </main>
    )
  }
}
