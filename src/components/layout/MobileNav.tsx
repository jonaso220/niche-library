import { NavLink } from 'react-router'
import { Home, Search, PlusCircle, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/search', icon: Search, label: 'Buscar' },
  { to: '/add', icon: PlusCircle, label: 'Agregar' },
  { to: '/shelf/wishlist', icon: Heart, label: 'Deseos' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0',
              isActive
                ? 'text-gold'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
