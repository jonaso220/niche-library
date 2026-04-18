import { AlertTriangle, X } from 'lucide-react'
import { useAuth } from '@/firebase/useAuth'

export function AuthErrorBanner() {
  const { error, clearError } = useAuth()

  if (!error) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mx-4 md:mx-6 lg:mx-8 mt-3 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3"
    >
      <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm text-danger">{error}</p>
      <button
        type="button"
        onClick={clearError}
        aria-label="Descartar error"
        className="text-danger/70 hover:text-danger transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
