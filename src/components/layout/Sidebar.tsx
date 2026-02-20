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
        'flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all',
        isActive
          ? 'bg-gold/10 text-gold font-medium'
          : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
      )}
    >
      {Icon && <Icon className="w-[15px] h-[15px] shrink-0" />}
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
    <div className="mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted/60 hover:text-text-muted transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={cn(
          'w-3 h-3 transition-transform duration-200',
          open ? 'rotate-0' : '-rotate-90'
        )} />
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
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
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5">
          <img src="/icon-192.png" alt="Niche Library" className="w-9 h-9 rounded-[10px]" />
          <div>
            <h1 className="text-[15px] font-bold text-text-primary leading-tight">
              Niche Library
            </h1>
            <p className="text-[10px] text-text-muted font-medium tracking-wide">
              COLECCIÓN PERSONAL
            </p>
          </div>
        </NavLink>
        <button onClick={onClose} className="lg:hidden p-1 text-text-muted hover:text-text-primary rounded-md">
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <NavLink
          to="/search"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-gold/8 border border-gold/12 rounded-lg text-[12px] font-medium text-gold/80 hover:bg-gold/12 hover:text-gold"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar
        </NavLink>
        <NavLink
          to="/add"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] font-medium text-text-secondary hover:bg-white/[0.05] hover:text-text-primary"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Agregar
        </NavLink>
      </div>

      <div className="mx-3 h-px bg-white/[0.04]" />

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
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
      <div className="px-3 py-2 border-t border-white/[0.04]">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all',
            isActive
              ? 'bg-gold/10 text-gold font-medium'
              : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
          )}
        >
          <Settings className="w-[15px] h-[15px]" />
          <span>Ajustes</span>
        </NavLink>
      </div>
    </div>
  )
}
