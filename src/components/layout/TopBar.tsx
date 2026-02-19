import { useNavigate } from 'react-router'
import { useState } from 'react'
import { Menu, Search } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2">
        <span className="text-xl">🧴</span>
        <h1 className="font-heading text-lg font-bold text-gold">Niche Library</h1>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar perfume por nombre o marca..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>
      </form>
    </header>
  )
}
