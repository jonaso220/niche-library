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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/[0.06] shadow-[0_-4px_20px] shadow-black/20">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 rounded-lg transition-all',
              isActive
                ? 'text-gold'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold shadow-sm shadow-gold/50" />
                  )}
                </div>
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
