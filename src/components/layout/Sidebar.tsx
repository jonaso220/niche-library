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
        'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all',
        isActive
          ? 'bg-gold/12 text-gold shadow-sm shadow-gold/5'
          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" />}
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted/70 mt-6 mb-1.5 px-3">
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
    <div className="flex flex-col h-full bg-surface/80 backdrop-blur-xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
          <img src="/icon-192.png" alt="Niche Library" className="w-10 h-10 rounded-xl shadow-lg shadow-black/20" />
          <div>
            <h1 className="text-base font-bold gradient-text leading-tight">
              Niche Library
            </h1>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-[0.15em]">
              Tu colección
            </p>
          </div>
        </NavLink>
        <button onClick={onClose} className="lg:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-2 py-1 flex gap-1.5">
        <NavLink
          to="/search"
          onClick={onClose}
          className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-[13px] text-text-secondary hover:text-gold hover:border-gold/20 hover:bg-gold/5"
        >
          <Search className="w-3.5 h-3.5 opacity-70" />
          <span>Buscar</span>
        </NavLink>
        <NavLink
          to="/add"
          onClick={onClose}
          className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-[13px] text-text-secondary hover:text-gold hover:border-gold/20 hover:bg-gold/5"
        >
          <PlusCircle className="w-3.5 h-3.5 opacity-70" />
          <span>Agregar</span>
        </NavLink>
      </div>

      <div className="w-full h-px bg-border/50 my-2 mx-2" />

      <nav className="flex-1 px-2 pb-2 space-y-0.5">
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
      <div className="p-2 border-t border-border/50">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all',
            isActive
              ? 'bg-gold/12 text-gold'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          )}
        >
          <Settings className="w-4 h-4 opacity-70" />
          <span>Ajustes</span>
        </NavLink>
      </div>
    </div>
  )
}
