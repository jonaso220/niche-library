import { useNavigate, Link } from 'react-router'
import { useId, useState, useRef, useEffect } from 'react'
import { Menu, Search, LogIn, LogOut, User, Command, Star, ChevronRight } from 'lucide-react'
import { useAuth } from '@/firebase/useAuth'
import { isFirebaseConfigured } from '@/firebase/config'
import { useSearchPerfumes } from '@/db/hooks'

interface TopBarProps {
  onMenuClick: () => void
  menuButtonRef?: React.Ref<HTMLButtonElement>
}

export function TopBar({ onMenuClick, menuButtonRef }: TopBarProps) {
  const navigate = useNavigate()
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth()

  const results = useSearchPerfumes(searchQuery)
  const resultsAreCurrent = searchQuery === query.trim()
  const hasQuery = isFocused && query.length >= 2
  const showDropdown = hasQuery && resultsAreCurrent && results && results.length > 0
  const showNoResults = hasQuery && resultsAreCurrent && results && results.length === 0
  const displayResults = results?.slice(0, 6) ?? []
  const hasSeeAll = !!(results && results.length > 6)
  const navigableCount = displayResults.length + (hasSeeAll ? 1 : 0)

  // Reset selection whenever the list changes or the dropdown closes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(-1)
  }, [query, isFocused])

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(query.trim()), 180)
    return () => clearTimeout(timeout)
  }, [query])

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
        setIsFocused(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      void navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false)
    }, 150)
  }

  function handleResultClick() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    setQuery('')
    setIsFocused(false)
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || navigableCount === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % navigableCount)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? navigableCount - 1 : i - 1))
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(navigableCount - 1)
      return
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      // If an option is highlighted, go there instead of submitting the form
      e.preventDefault()
      if (activeIndex < displayResults.length) {
        const perfume = displayResults[activeIndex]
        handleResultClick()
        void navigate(`/perfume/${perfume.id}`)
      } else {
        // "See all results" option
        handleResultClick()
        void navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const optionId = (i: number) => `${listboxId}-option-${String(i)}`
  const activeOptionId = activeIndex >= 0 ? optionId(activeIndex) : undefined

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/[0.06]">
      <div className="flex items-center gap-4 px-4 md:px-6 lg:px-8 h-16">
        {/* Mobile menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-gold rounded-xl hover:bg-gold/[0.06] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 shrink-0">
          <img src="/icon-192.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-lg shadow-md shadow-black/20" />
          <span className="font-bold text-[15px] gradient-text hidden sm:block">Niche Library</span>
        </div>

        {/* Search — fills all available space, no max-width */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 relative" role="search">
          <div className={`relative group rounded-xl transition-all duration-300 ${isFocused ? 'shadow-md shadow-gold/[0.06]' : ''}`}>
            {/* Subtle gold glow border on focus */}
            <div className={`absolute -inset-px rounded-xl bg-gradient-to-r from-gold/20 via-gold/8 to-gold/20 transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`relative flex items-center rounded-xl transition-all duration-200 overflow-hidden ${isFocused ? 'bg-white/[0.06]' : 'bg-white/[0.04] hover:bg-white/[0.05]'} border ${isFocused ? 'border-gold/20' : 'border-white/[0.07] hover:border-white/[0.10]'}`}>
              <Search className={`ml-3.5 w-4 h-4 shrink-0 transition-colors duration-200 ${isFocused ? 'text-gold' : 'text-text-muted/50'}`} aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={handleInputKeyDown}
                placeholder="Buscar fragancias, marcas, notas..."
                className="w-full px-3 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none"
                role="combobox"
                aria-label="Buscar fragancias"
                aria-expanded={!!showDropdown}
                aria-controls={showDropdown ? listboxId : undefined}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
              />
              {!query && !isFocused && (
                <div className="hidden lg:flex items-center gap-1 mr-3 shrink-0">
                  <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.07] rounded-md text-[10px] text-text-muted/40 font-medium">
                    <Command className="w-2.5 h-2.5" aria-hidden="true" />
                    K
                  </kbd>
                </div>
              )}
            </div>
          </div>

          {/* Live search dropdown */}
          {showDropdown && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Resultados de búsqueda"
              className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 list-none m-0 p-0"
            >
              {displayResults.map((perfume, i) => {
                const active = activeIndex === i
                return (
                  <li key={perfume.id} role="option" id={optionId(i)} aria-selected={active}>
                    <Link
                      to={`/perfume/${perfume.id}`}
                      onClick={handleResultClick}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.05]'}`}
                    >
                      {perfume.imageUrl ? (
                        <img
                          src={perfume.imageUrl}
                          alt={`${perfume.brand} ${perfume.name}`}
                          loading="lazy"
                          className="w-9 h-12 object-cover rounded-lg bg-white/[0.03]"
                        />
                      ) : (
                        <div className="w-9 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center">
                          <Search className="w-3.5 h-3.5 text-text-muted/30" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary truncate">{perfume.name}</p>
                        <p className="text-[11px] text-text-muted truncate">{perfume.brand}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-gold fill-gold" aria-hidden="true" />
                        <span className="text-xs text-text-muted">{perfume.rating.toFixed(1)}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}

              {hasSeeAll && (() => {
                const i = displayResults.length
                const active = activeIndex === i
                return (
                  <li role="option" id={optionId(i)} aria-selected={active}>
                    <Link
                      to={`/search?q=${encodeURIComponent(query.trim())}`}
                      onClick={handleResultClick}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 border-t border-border/40 text-xs font-medium text-gold transition-colors ${active ? 'bg-gold/[0.08]' : 'hover:bg-gold/[0.04]'}`}
                    >
                      Ver todos los resultados
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                )
              })()}
            </ul>
          )}

          {/* No results feedback */}
          {showNoResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              <p className="px-3.5 py-3 text-sm text-text-muted text-center" role="status">Sin resultados para "{query}"</p>
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
                    alt={user.displayName ? `Avatar de ${user.displayName}` : 'Avatar de usuario'}
                    className="w-9 h-9 rounded-full ring-2 ring-gold/25 ring-offset-2 ring-offset-background shadow-lg shadow-gold/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-1 ring-gold/20">
                    <User className="w-4.5 h-4.5 text-gold" aria-hidden="true" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 text-text-muted hover:text-accent-rose rounded-xl hover:bg-accent-rose/10 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold/15 to-gold/8 border border-gold/20 rounded-xl text-[13px] font-semibold text-gold hover:from-gold/20 hover:to-gold/12 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Conectar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
