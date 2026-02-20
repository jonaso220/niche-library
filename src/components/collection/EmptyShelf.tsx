import { Link } from 'react-router'
import { Search, PlusCircle } from 'lucide-react'

interface EmptyShelfProps {
  message?: string
}

export function EmptyShelf({ message = 'No hay perfumes en esta estantería' }: EmptyShelfProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        <img src="/icon-192.png" alt="" className="w-7 h-7 rounded-lg opacity-40" />
      </div>
      <h2 className="text-base font-semibold text-text-secondary mb-1">{message}</h2>
      <p className="text-sm text-text-muted mb-5 max-w-sm leading-relaxed">
        Busca perfumes en el catálogo y agrégalos a tu colección.
      </p>
      <div className="flex gap-2">
        <Link
          to="/search"
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-background rounded-lg text-sm font-semibold hover:bg-gold-bright glow-gold"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar
        </Link>
        <Link
          to="/add"
          className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Agregar
        </Link>
      </div>
    </div>
  )
}
