import { useState } from 'react'
import { db } from '@/db/database'
import { isApiConfigured } from '@/api/fragella'
import { Key, Download, Upload, Trash2, Database, CheckCircle } from 'lucide-react'

export function SettingsPage() {
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
