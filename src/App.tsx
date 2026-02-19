import { BrowserRouter, Routes, Route } from 'react-router'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ShelfPage } from '@/pages/ShelfPage'
import { PerfumePage } from '@/pages/PerfumePage'
import { SearchPage } from '@/pages/SearchPage'
import { AddManualPage } from '@/pages/AddManualPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { seedDatabaseIfNeeded } from '@/db/seed'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedDatabaseIfNeeded().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-heading text-gold mb-2">Niche Library</h1>
          <p className="text-text-secondary">Cargando tu colección...</p>
        </div>
      </div>
    )
  }

  return (
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
  )
}

export default App
