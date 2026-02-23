import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from '@/firebase/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ShelfPage } from '@/pages/ShelfPage'
import { PerfumePage } from '@/pages/PerfumePage'
import { SearchPage } from '@/pages/SearchPage'
import { AddManualPage } from '@/pages/AddManualPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
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
