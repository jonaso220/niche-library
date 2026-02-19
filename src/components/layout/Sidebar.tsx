import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { getShelfsByCategory } from '@/lib/constants'
import {
  Library, Heart, Trophy,
  Flower2, Sun, Leaf, Snowflake,
  SunMedium, Moon, Clock,
  Briefcase, Shirt, PartyPopper, HeartHandshake, Sparkles,
  TreePine, Flame, Wind, Flower, Citrus,
  Search, PlusCircle, Settings, X,
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
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-gold/15 text-gold'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mt-5 mb-2 px-3">
      {children}
    </h3>
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
      <div className="flex items-center justify-between p-4 border-b border-border">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Niche Library" className="w-9 h-9 rounded-lg shadow-sm" />
          <div>
            <h1 className="font-heading text-lg font-bold text-gold leading-tight">
              Niche Library
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              Tu colección
            </p>
          </div>
        </NavLink>
        <button onClick={onClose} className="lg:hidden p-1 text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-2">
        {/* Quick actions */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Search className="w-4 h-4 text-text-muted" />
          <NavLink
            to="/search"
            onClick={onClose}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Buscar Perfume
          </NavLink>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <PlusCircle className="w-4 h-4 text-text-muted" />
          <NavLink
            to="/add"
            onClick={onClose}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Agregar Manual
          </NavLink>
        </div>

        {/* Colección */}
        <SectionTitle>Colección</SectionTitle>
        {coleccion.map(shelf => (
          <NavItem
            key={shelf.id}
            to={shelf.id === 'all' ? '/shelf/all' : shelf.id === 'wishlist' ? '/shelf/wishlist' : `/shelf/${shelf.id}`}
            icon={shelf.icon}
            label={shelf.label}
            onClose={onClose}
          />
        ))}

        {/* Temporadas */}
        <SectionTitle>Temporadas</SectionTitle>
        {temporada.map(shelf => (
          <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
        ))}

        {/* Horario */}
        <SectionTitle>Horario</SectionTitle>
        {horario.map(shelf => (
          <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
        ))}

        {/* Ocasiones */}
        <SectionTitle>Ocasiones</SectionTitle>
        {ocasion.map(shelf => (
          <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
        ))}

        {/* Familias Olfativas */}
        <SectionTitle>Familias Olfativas</SectionTitle>
        {familia.map(shelf => (
          <NavItem key={shelf.id} to={`/shelf/${shelf.id}`} icon={shelf.icon} label={shelf.label} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes</span>
        </NavLink>
      </div>
    </div>
  )
}
