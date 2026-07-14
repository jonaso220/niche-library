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
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 glass border border-white/[0.08] rounded-2xl shadow-[0_18px_55px] shadow-black/45">
      <div className="flex items-center justify-around px-1.5 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all',
              isActive
                ? 'text-gold bg-gold/[0.08]'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {isActive && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gold shadow-sm shadow-gold/50" />}
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
