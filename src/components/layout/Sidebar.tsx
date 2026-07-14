import { NavLink } from 'react-router'
import { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import { getShelfsByCategory } from '@/lib/constants'
import {
  Library, Heart, Archive,
  Flower2, Sun, Leaf, Snowflake,
  TreePine, Flame, Wind, Flower, Citrus,
  Search, PlusCircle, Settings, X, ChevronDown,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Library, Heart, Archive,
  Flower2, Sun, Leaf, Snowflake,
  TreePine, Flame, Wind, Flower, Citrus,
}

interface SidebarProps {
  onClose: () => void
}

function NavItem({ to, icon: IconName, label, onClose }: {
  to: string
  icon: string
  label: string
  onClose: () => void
}) {
  const Icon = ICON_MAP[IconName]
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold font-semibold shadow-[inset_0_0_0_1px] shadow-gold/10'
          : 'text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
      )}
    >
      {Icon && <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function CollapsibleSection({ title, children, defaultOpen = false }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const sectionId = useId()

  return (
    <div className="mt-4 pt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={sectionId}
        className="flex items-center justify-between w-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted/80 hover:text-text-secondary transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90',
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={sectionId} className="space-y-0.5 mt-1.5">
          {children}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ onClose }: SidebarProps) {
  const temporada = getShelfsByCategory('temporada')
  const familia = getShelfsByCategory('familia')
  const coleccion = getShelfsByCategory('coleccion')

  return (
    <div className="flex flex-col h-full bg-surface/80 backdrop-blur-xl overflow-y-auto border-r border-border/30">
      {/* Header with gradient accent */}
      <div className="relative px-5 py-6">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3.5 group">
            <div className="relative">
              <img src="/icon-192.png" alt="" aria-hidden="true" className="w-11 h-11 rounded-xl shadow-lg shadow-black/30" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary leading-tight group-hover:text-gold transition-colors">
                Niche Library
              </h1>
              <p className="text-[10px] text-gold-dim font-semibold tracking-[0.15em] uppercase mt-0.5">
                COLECCIÓN PERSONAL
              </p>
            </div>
          </NavLink>
          <button
            data-mobile-close
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4 flex gap-2.5">
        <NavLink
          to="/search"
          onClick={onClose}
          className="flex items-center justify-center gap-2 flex-1 py-3 bg-gold/10 border border-gold/15 rounded-xl text-[13px] font-semibold text-gold hover:bg-gold/15 hover:border-gold/25 hover:shadow-lg hover:shadow-gold/5 transition-all"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Buscar
        </NavLink>
        <NavLink
          to="/add"
          onClick={onClose}
          className="flex items-center justify-center gap-2 flex-1 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-semibold text-text-secondary hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12] transition-all"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          Agregar
        </NavLink>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Colección */}
        <CollapsibleSection title="Colección" defaultOpen>
          {coleccion.map(shelf => (
            <NavItem
              key={shelf.id}
              to={shelf.id === 'all' ? '/shelf/all' : shelf.id === 'wishlist' ? '/shelf/wishlist' : `/shelf/${shelf.id}`}
              icon={shelf.icon}
              label={shelf.label}
              onClose={onClose}
            />
          ))}
        </CollapsibleSection>

        {/* Temporadas */}
        <CollapsibleSection title="Temporadas" defaultOpen>
          {temporada.map(shelf => (
            <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
          ))}
        </CollapsibleSection>

        {/* Familias Olfativas */}
        <CollapsibleSection title="Familias Olfativas">
          {familia.map(shelf => (
            <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
          ))}
        </CollapsibleSection>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.05]">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold font-semibold'
              : 'text-text-muted hover:text-text-primary hover:bg-white/[0.05]'
          )}
        >
          <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
          <span>Ajustes</span>
        </NavLink>
      </div>
    </div>
  )
}
