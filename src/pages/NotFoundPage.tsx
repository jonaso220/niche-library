import { Link } from 'react-router'
import { SearchX } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div className="space-y-4">
        <SearchX className="w-10 h-10 text-gold mx-auto" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-dim">Error 404</p>
          <h1 className="text-2xl font-bold mt-1">Página no encontrada</h1>
          <p className="text-sm text-text-secondary mt-2">La dirección que abriste no existe.</p>
        </div>
        <Link to="/" className="inline-flex px-5 py-2.5 rounded-xl bg-gold text-background font-semibold">Volver al inicio</Link>
      </div>
    </div>
  )
}
