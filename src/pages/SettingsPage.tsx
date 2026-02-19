import { useState } from 'react'
import { db } from '@/db/database'
import { isApiConfigured } from '@/api/fragella'
import { useAuth } from '@/firebase/AuthContext'
import { isFirebaseConfigured } from '@/firebase/config'
import { Key, Download, Upload, Trash2, Database, CheckCircle, Cloud, CloudOff, LogIn, LogOut, User } from 'lucide-react'

export function SettingsPage() {
  const { user, isAuthenticated, signInWithGoogle, signOut, loading: authLoading } = useAuth()
  const [apiKey, setApiKey] = useState(localStorage.getItem('fragella_api_key') ?? '')
  const [saved, setSaved] = useState(false)
  const [importing, setImporting] = useState(false)

  function handleSaveApiKey() {
    if (apiKey.trim()) {
      localStorage.setItem('fragella_api_key', apiKey.trim())
    } else {
      localStorage.removeItem('fragella_api_key')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">Ajustes</h1>
        <p className="text-sm text-text-secondary mt-1">Configura tu biblioteca</p>
      </div>

      {/* Cloud Sync */}
      {isFirebaseConfigured && (
        <section className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Cloud className="w-4 h-4 text-accent-green" />
            ) : (
              <CloudOff className="w-4 h-4 text-text-muted" />
            )}
            <h2 className="font-heading text-lg font-semibold text-text-primary">Sincronización en la Nube</h2>
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'Avatar'}
                    className="w-10 h-10 rounded-full border-2 border-gold/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user.displayName ?? 'Usuario'}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-accent-green">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Conectado
                </span>
              </div>

              <p className="text-xs text-text-muted">
                Tu colección se sincroniza automáticamente con la nube. Los perfumes que agregues, modifiques o elimines se guardarán en tu cuenta de Google.
              </p>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-danger hover:border-danger/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Inicia sesión con tu cuenta de Google para sincronizar tu colección en la nube.
                Podrás acceder a tus perfumes desde cualquier dispositivo.
              </p>
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {authLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* API Key */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-gold" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">API de Fragella</h2>
        </div>
        <p className="text-xs text-text-muted">
          Regístrate gratis en api.fragella.com para obtener 20 búsquedas/mes.
          Esto te permite buscar perfumes que no están en el catálogo local.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Tu API key de Fragella"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
          />
          <button
            onClick={handleSaveApiKey}
            className="px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
          >
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {isApiConfigured() ? (
            <span className="flex items-center gap-1 text-accent-green">
              <CheckCircle className="w-3.5 h-3.5" />
              API configurada
            </span>
          ) : (
            <span className="text-text-muted">API no configurada (solo búsqueda local)</span>
          )}
        </div>
      </section>

      {/* Data management */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-accent-blue" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">Datos</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Colección (JSON)
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar desde JSON'}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-card border border-danger/20 rounded-xl p-5 space-y-3">
        <h2 className="font-heading text-lg font-semibold text-danger">Zona de Peligro</h2>
        <p className="text-xs text-text-muted">
          Esto eliminará toda tu colección, catálogo y configuraciones. No se puede deshacer.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger hover:bg-danger/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Resetear Todo
        </button>
      </section>
    </div>
  )
}
