import { NavLink } from 'react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getShelfsByCategory } from '@/lib/constants'
import {
  Library, Heart, Trophy,
  Flower2, Sun, Leaf, Snowflake,
  SunMedium, Moon, Clock,
  Briefcase, Shirt, PartyPopper, HeartHandshake, Sparkles,
  TreePine, Flame, Wind, Flower, Citrus,
  Search, PlusCircle, Settings, X, ChevronDown,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Library, Heart, Trophy,
  Flower2, Sun, Leaf, Snowflake,
  SunMedium, Moon, Clock,
  Briefcase, Shirt, PartyPopper, HeartHandshake, Sparkles,
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
        'flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold font-semibold shadow-[inset_0_0_0_1px] shadow-gold/10'
          : 'text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
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

  return (
    <div className="mt-3 pt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted/80 hover:text-text-secondary transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={cn(
          'w-3 h-3 transition-transform duration-200',
          open ? 'rotate-0' : '-rotate-90'
        )} />
      </button>
      {open && (
        <div className="space-y-0.5 mt-1">
          {children}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ onClose }: SidebarProps) {
  const temporada = getShelfsByCategory('temporada')
  const horario = getShelfsByCategory('horario')
  const ocasion = getShelfsByCategory('ocasion')
  const familia = getShelfsByCategory('familia')
  const coleccion = getShelfsByCategory('coleccion')

  return (
    <div className="flex flex-col h-full bg-surface/80 backdrop-blur-xl overflow-y-auto border-r border-border/30">
      {/* Header with gradient accent */}
      <div className="relative px-4 py-5">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/icon-192.png" alt="Niche Library" className="w-10 h-10 rounded-xl shadow-lg shadow-black/30" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-text-primary leading-tight group-hover:text-gold transition-colors">
                Niche Library
              </h1>
              <p className="text-[9px] text-gold-dim font-semibold tracking-[0.15em] uppercase mt-0.5">
                COLECCIÓN PERSONAL
              </p>
            </div>
          </NavLink>
          <button onClick={onClose} className="lg:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/[0.06]">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <NavLink
          to="/search"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-gold/10 border border-gold/15 rounded-xl text-[12px] font-semibold text-gold hover:bg-gold/15 hover:border-gold/25 hover:shadow-lg hover:shadow-gold/5 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar
        </NavLink>
        <NavLink
          to="/add"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[12px] font-semibold text-text-secondary hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12] transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Agregar
        </NavLink>
      </div>

      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
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

        {/* Horario */}
        <CollapsibleSection title="Horario">
          {horario.map(shelf => (
            <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
          ))}
        </CollapsibleSection>

        {/* Ocasiones */}
        <CollapsibleSection title="Ocasiones">
          {ocasion.map(shelf => (
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
      <div className="px-2 py-2.5 border-t border-white/[0.05]">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold font-semibold'
              : 'text-text-muted hover:text-text-primary hover:bg-white/[0.05]'
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes</span>
        </NavLink>
      </div>
    </div>
  )
}
