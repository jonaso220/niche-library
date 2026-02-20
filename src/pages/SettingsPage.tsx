import { useState } from 'react'
import { db } from '@/db/database'
import { isApiConfigured } from '@/api/fragella'
import { isFragranceFinderConfigured } from '@/api/fragrancefinder'
import { useAuth } from '@/firebase/AuthContext'
import { isFirebaseConfigured } from '@/firebase/config'
import { Key, Download, Upload, Trash2, Database, CheckCircle, Cloud, CloudOff, LogIn, LogOut, User, Search } from 'lucide-react'

export function SettingsPage() {
  const { user, isAuthenticated, signInWithGoogle, signOut, loading: authLoading } = useAuth()
  const [fragellaKey, setFragellaKey] = useState(localStorage.getItem('fragella_api_key') ?? '')
  const [ffKey, setFfKey] = useState(localStorage.getItem('fragrancefinder_api_key') ?? '')
  const [savedFragella, setSavedFragella] = useState(false)
  const [savedFF, setSavedFF] = useState(false)
  const [importing, setImporting] = useState(false)

  function handleSaveFragellaKey() {
    if (fragellaKey.trim()) {
      localStorage.setItem('fragella_api_key', fragellaKey.trim())
    } else {
      localStorage.removeItem('fragella_api_key')
    }
    setSavedFragella(true)
    setTimeout(() => setSavedFragella(false), 2000)
  }

  function handleSaveFFKey() {
    if (ffKey.trim()) {
      localStorage.setItem('fragrancefinder_api_key', ffKey.trim())
    } else {
      localStorage.removeItem('fragrancefinder_api_key')
    }
    setSavedFF(true)
    setTimeout(() => setSavedFF(false), 2000)
  }

  async function handleExport() {
    const perfumes = await db.perfumes.toArray()
    const collection = await db.collection.toArray()
    const data = { perfumes, collection, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `niche-library-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setImporting(true)
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.perfumes && Array.isArray(data.perfumes)) {
          await db.perfumes.bulkPut(data.perfumes)
        }
        if (data.collection && Array.isArray(data.collection)) {
          await db.collection.bulkPut(data.collection)
        }

        alert(`Importación exitosa: ${data.perfumes?.length ?? 0} perfumes, ${data.collection?.length ?? 0} entradas de colección`)
      } catch {
        alert('Error al importar. Verifica que el archivo sea válido.')
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  async function handleReset() {
    if (!window.confirm('¿Estás seguro? Esto eliminará todos los datos de tu colección y catálogo local. Esta acción no se puede deshacer.')) return
    await db.delete()
    localStorage.removeItem('niche-library-seed-v')
    window.location.reload()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-sm text-text-secondary mt-1">Configura tu biblioteca</p>
      </div>

      {/* Cloud Sync */}
      {isFirebaseConfigured && (
        <section className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="w-8 h-8 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <Cloud className="w-4 h-4 text-accent-green" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <CloudOff className="w-4 h-4 text-text-muted" />
              </div>
            )}
            <h2 className="text-base font-semibold">Sincronización en la Nube</h2>
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'Avatar'}
                    className="w-10 h-10 rounded-full ring-2 ring-gold/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName ?? 'Usuario'}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-accent-green font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Conectado
                </span>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Tu colección se sincroniza automáticamente con la nube. Los cambios se guardan en tu cuenta de Google.
              </p>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-text-secondary hover:text-danger hover:border-danger/20"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-muted leading-relaxed">
                Inicia sesión con tu cuenta de Google para sincronizar tu colección en la nube.
                Podrás acceder a tus perfumes desde cualquier dispositivo.
              </p>
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-background rounded-xl text-sm font-semibold hover:bg-gold-bright disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                <LogIn className="w-4 h-4" />
                {authLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* APIs de Búsqueda */}
      <section className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h2 className="text-base font-semibold">APIs de Búsqueda</h2>
            <p className="text-xs text-text-muted mt-0.5">Configura las APIs para buscar fragancias online</p>
          </div>
        </div>

        {/* Fragella */}
        <div className="space-y-2.5 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-gold/60" />
              <span className="text-sm font-semibold">Fragella</span>
            </div>
            {isApiConfigured() ? (
              <span className="flex items-center gap-1 text-[10px] text-accent-green font-medium">
                <CheckCircle className="w-3 h-3" />
                Configurada
              </span>
            ) : (
              <span className="text-[10px] text-text-muted">No configurada</span>
            )}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Datos más completos (notas, acordes, estaciones). 20 búsquedas/mes gratis.{' '}
            <a href="https://api.fragella.com" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline underline-offset-2">
              Obtener key
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={fragellaKey}
              onChange={(e) => setFragellaKey(e.target.value)}
              placeholder="Tu API key de Fragella"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
            />
            <button
              onClick={handleSaveFragellaKey}
              className="px-3.5 py-2 bg-gold text-background rounded-lg text-xs font-semibold hover:bg-gold-bright shadow-lg shadow-gold/20"
            >
              {savedFragella ? '✓' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* FragranceFinder */}
        <div className="space-y-2.5 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-accent-blue/60" />
              <span className="text-sm font-semibold">FragranceFinder</span>
              <span className="text-[9px] text-text-muted/50 font-medium px-1.5 py-0.5 bg-white/[0.04] rounded">RapidAPI</span>
            </div>
            {isFragranceFinderConfigured() ? (
              <span className="flex items-center gap-1 text-[10px] text-accent-green font-medium">
                <CheckCircle className="w-3 h-3" />
                Configurada
              </span>
            ) : (
              <span className="text-[10px] text-text-muted">No configurada</span>
            )}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Búsqueda de fragancias + dupes. 20 búsquedas/mes gratis.{' '}
            <a href="https://rapidapi.com/remote-skills-remote-skills-default/api/fragrancefinder-api" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline underline-offset-2">
              Obtener key en RapidAPI
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={ffKey}
              onChange={(e) => setFfKey(e.target.value)}
              placeholder="Tu RapidAPI key"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
            />
            <button
              onClick={handleSaveFFKey}
              className="px-3.5 py-2 bg-gold text-background rounded-lg text-xs font-semibold hover:bg-gold-bright shadow-lg shadow-gold/20"
            >
              {savedFF ? '✓' : 'Guardar'}
            </button>
          </div>
        </div>
      </section>

      {/* Data management */}
      <section className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-accent-blue" />
          </div>
          <h2 className="text-base font-semibold">Datos</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-text-secondary hover:text-gold hover:border-gold/20"
          >
            <Download className="w-4 h-4" />
            Exportar Colección (JSON)
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-text-secondary hover:text-gold hover:border-gold/20 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar desde JSON'}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-danger/[0.04] border border-danger/15 rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-semibold text-danger">Zona de Peligro</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Esto eliminará toda tu colección, catálogo y configuraciones. No se puede deshacer.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/15 rounded-xl text-sm text-danger hover:bg-danger/15"
        >
          <Trash2 className="w-4 h-4" />
          Resetear Todo
        </button>
      </section>
    </div>
  )
}
