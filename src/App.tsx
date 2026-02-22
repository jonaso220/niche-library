import { BrowserRouter, Routes, Route } from 'react-router'
import { useEffect, useState } from 'react'
import { AuthProvider } from '@/firebase/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ShelfPage } from '@/pages/ShelfPage'
import { PerfumePage } from '@/pages/PerfumePage'
import { SearchPage } from '@/pages/SearchPage'
import { AddManualPage } from '@/pages/AddManualPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { seedDatabaseIfNeeded } from '@/db/seed'
import { importFragranticaCollection, isFragranticaImportDone } from '@/db/fragrantica-import'

function App() {
  const [ready, setReady] = useState(false)
  const [importProgress, setImportProgress] = useState('')

  useEffect(() => {
    async function init() {
      await seedDatabaseIfNeeded()

      // Import Fragrantica collection (runs once)
      if (!isFragranticaImportDone()) {
        setImportProgress('Importando colección de Fragrantica...')
        await importFragranticaCollection((done, total, current) => {
          setImportProgress(`Importando ${done}/${total}: ${current}`)
        })
      }

      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <img src="/icon-192.png" alt="Niche Library" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg shadow-gold/10" />
          <h1 className="text-3xl font-heading text-gold mb-2">Niche Library</h1>
          <p className="text-text-secondary">
            {importProgress || 'Cargando tu colección...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="shelf/:shelfId" element={<ShelfPage />} />
            <Route path="perfume/:perfumeId" element={<PerfumePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="add" element={<AddManualPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
