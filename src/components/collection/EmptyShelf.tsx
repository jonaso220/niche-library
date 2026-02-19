import { Link } from 'react-router'
import { Search, PlusCircle } from 'lucide-react'

interface EmptyShelfProps {
  message?: string
}

export function EmptyShelf({ message = 'No hay perfumes en esta estantería' }: EmptyShelfProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">🧴</span>
      <h2 className="font-heading text-xl text-text-secondary mb-2">{message}</h2>
      <p className="text-sm text-text-muted mb-6 max-w-md">
        Busca perfumes en el catálogo y agrégalos a tu colección para verlos organizados aquí.
      </p>
      <div className="flex gap-3">
        <Link
          to="/search"
          className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
        >
          <Search className="w-4 h-4" />
          Buscar Perfumes
        </Link>
        <Link
          to="/add"
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar Manual
        </Link>
      </div>
    </div>
  )
}
