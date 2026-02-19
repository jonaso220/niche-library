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
    <header className="sticky top-0 z-20 glass border-b border-glass-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2.5">
          <img src="/icon-192.png" alt="Niche Library" className="w-8 h-8 rounded-xl" />
          <h1 className="text-lg font-bold gradient-text">Niche Library</h1>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar perfume por nombre o marca..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/40 focus:bg-white/8 focus:ring-1 focus:ring-gold/20"
            />
          </div>
        </form>

        {/* Auth section */}
        {isFirebaseConfigured && (
          <div className="ml-2 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ''}
                    className="w-8 h-8 rounded-full ring-2 ring-gold/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-white/5"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-sm text-gold hover:bg-gold/15 hover:border-gold/30"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
