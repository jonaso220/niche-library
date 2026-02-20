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
    <header className="sticky top-0 z-20 glass border-b border-white/[0.06] shadow-lg shadow-black/10">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-gold rounded-lg hover:bg-gold/[0.06] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5">
          <img src="/icon-192.png" alt="" className="w-7 h-7 rounded-lg shadow-md shadow-black/20" />
          <span className="font-bold text-sm gradient-text">Niche Library</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg lg:max-w-2xl ml-auto">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar perfume..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-gold/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-gold/15 focus:shadow-lg focus:shadow-gold/5"
            />
          </div>
        </form>

        {/* Auth section */}
        {isFirebaseConfigured && (
          <div className="shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ''}
                    className="w-8 h-8 rounded-full ring-2 ring-gold/25 ring-offset-2 ring-offset-background shadow-lg shadow-gold/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-1 ring-gold/20">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 text-text-muted hover:text-accent-rose rounded-lg hover:bg-accent-rose/10 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold/15 to-gold/8 border border-gold/20 rounded-xl text-[13px] font-semibold text-gold hover:from-gold/20 hover:to-gold/12 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all"
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
