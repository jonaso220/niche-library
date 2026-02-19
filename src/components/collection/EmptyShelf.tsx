import { Link } from 'react-router'
import { Search, PlusCircle, Sparkles } from 'lucide-react'

interface EmptyShelfProps {
  message?: string
}

export function EmptyShelf({ message = 'No hay perfumes en esta estantería' }: EmptyShelfProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
        <Sparkles className="w-8 h-8 text-text-muted/50" />
      </div>
      <h2 className="text-lg font-semibold text-text-secondary mb-1.5">{message}</h2>
      <p className="text-sm text-text-muted mb-6 max-w-md leading-relaxed">
        Busca perfumes en el catálogo y agrégalos a tu colección para verlos organizados aquí.
      </p>
      <div className="flex gap-2.5">
        <Link
          to="/search"
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-background rounded-xl text-sm font-semibold hover:bg-gold-bright shadow-lg shadow-gold/20"
        >
          <Search className="w-4 h-4" />
          Buscar Perfumes
        </Link>
        <Link
          to="/add"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-medium text-text-secondary hover:text-gold hover:border-gold/20"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar Manual
        </Link>
      </div>
    </div>
  )
}
