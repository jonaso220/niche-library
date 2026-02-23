import { useNavigate, Link } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { Menu, Search, LogIn, LogOut, User, Command, Star, ChevronRight } from 'lucide-react'
import { useAuth } from '@/firebase/AuthContext'
import { isFirebaseConfigured } from '@/firebase/config'
import { useSearchPerfumes } from '@/db/hooks'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth()

  const results = useSearchPerfumes(query)
  const showDropdown = isFocused && query.length >= 2 && results && results.length > 0
  const displayResults = results?.slice(0, 6) ?? []

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 150)
  }

  function handleResultClick() {
    setQuery('')
    setIsFocused(false)
  }

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/[0.06]">
      <div className="flex items-center gap-4 px-4 md:px-6 lg:px-8 h-16">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-gold rounded-xl hover:bg-gold/[0.06] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 shrink-0">
          <img src="/icon-192.png" alt="" className="w-8 h-8 rounded-lg shadow-md shadow-black/20" />
          <span className="font-bold text-[15px] gradient-text hidden sm:block">Niche Library</span>
        </div>

        {/* Search — fills all available space, no max-width */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 relative">
          <div className={`relative group rounded-xl transition-all duration-300 ${isFocused ? 'shadow-md shadow-gold/[0.06]' : ''}`}>
            {/* Subtle gold glow border on focus */}
            <div className={`absolute -inset-px rounded-xl bg-gradient-to-r from-gold/20 via-gold/8 to-gold/20 transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`relative flex items-center rounded-xl transition-all duration-200 overflow-hidden ${isFocused ? 'bg-white/[0.06]' : 'bg-white/[0.04] hover:bg-white/[0.05]'} border ${isFocused ? 'border-gold/20' : 'border-white/[0.07] hover:border-white/[0.10]'}`}>
              <Search className={`ml-3.5 w-4 h-4 shrink-0 transition-colors duration-200 ${isFocused ? 'text-gold' : 'text-text-muted/50'}`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                placeholder="Buscar fragancias, marcas, notas..."
                className="w-full px-3 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none"
              />
              {!query && !isFocused && (
                <div className="hidden lg:flex items-center gap-1 mr-3 shrink-0">
                  <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.07] rounded-md text-[10px] text-text-muted/40 font-medium">
                    <Command className="w-2.5 h-2.5" />
                    K
                  </kbd>
                </div>
              )}
            </div>
          </div>

          {/* Live search dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              {displayResults.map(perfume => (
                <Link
                  key={perfume.id}
                  to={`/perfume/${perfume.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.05] transition-colors"
                >
                  {perfume.imageUrl ? (
                    <img
                      src={perfume.imageUrl}
                      alt=""
                      className="w-9 h-12 object-cover rounded-lg bg-white/[0.03]"
                    />
                  ) : (
                    <div className="w-9 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <Search className="w-3.5 h-3.5 text-text-muted/30" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{perfume.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{perfume.brand}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <span className="text-xs text-text-muted">{perfume.rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}

              {results && results.length > 6 && (
                <Link
                  to={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border-t border-border/40 text-xs font-medium text-gold hover:bg-gold/[0.04] transition-colors"
                >
                  Ver todos los resultados
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
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
                    className="w-9 h-9 rounded-full ring-2 ring-gold/25 ring-offset-2 ring-offset-background shadow-lg shadow-gold/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-1 ring-gold/20">
                    <User className="w-4.5 h-4.5 text-gold" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-2 text-text-muted hover:text-accent-rose rounded-xl hover:bg-accent-rose/10 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold/15 to-gold/8 border border-gold/20 rounded-xl text-[13px] font-semibold text-gold hover:from-gold/20 hover:to-gold/12 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Conectar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
