import { useNavigate } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { Menu, Search, LogIn, LogOut, User, Command } from 'lucide-react'
import { useAuth } from '@/firebase/AuthContext'
import { isFirebaseConfigured } from '@/firebase/config'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth()

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/[0.06] shadow-lg shadow-black/10">
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

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl lg:max-w-3xl mx-auto">
          <div className={`relative group rounded-2xl transition-all duration-300 ${isFocused ? 'shadow-lg shadow-gold/[0.07]' : ''}`}>
            {/* Subtle gold glow border on focus */}
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-gold/25 via-gold/10 to-gold/25 transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

            <div className="relative flex items-center bg-white/[0.04] group-hover:bg-white/[0.06] border border-white/[0.08] group-hover:border-white/[0.12] rounded-2xl transition-all duration-200 overflow-hidden">
              <Search className={`ml-4 w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${isFocused ? 'text-gold' : 'text-text-muted/60'}`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Buscar fragancias, marcas, notas..."
                className="w-full px-3 py-3 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none font-medium"
              />
              {!query && !isFocused && (
                <div className="hidden md:flex items-center gap-1 mr-3.5 shrink-0">
                  <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] text-text-muted/60 font-medium">
                    <Command className="w-2.5 h-2.5" />
                    K
                  </kbd>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Auth section */}
        {isFirebaseConfigured && (
          <div className="shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
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
