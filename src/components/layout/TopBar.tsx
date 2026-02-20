import { useNavigate } from 'react-router'
import { useState } from 'react'
import { Menu, Search, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/firebase/AuthContext'
import { isFirebaseConfigured } from '@/firebase/config'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/[0.04]">
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/[0.04]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <img src="/icon-192.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-sm text-text-primary">Niche Library</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg lg:max-w-xl ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar perfume..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/30 focus:bg-white/[0.06]"
            />
          </div>
        </form>

        {/* Auth section */}
        {isFirebaseConfigured && (
          <div className="shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ''}
                    className="w-8 h-8 rounded-full ring-2 ring-gold/20 ring-offset-1 ring-offset-background"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/[0.04]"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/8 border border-gold/15 rounded-lg text-[13px] font-medium text-gold hover:bg-gold/12"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Conectar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
