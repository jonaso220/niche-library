import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from '@/firebase/AuthProvider'
import { AppShell } from '@/components/layout/AppShell'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const ShelfPage = lazy(() => import('@/pages/ShelfPage').then(m => ({ default: m.ShelfPage })))
const PerfumePage = lazy(() => import('@/pages/PerfumePage').then(m => ({ default: m.PerfumePage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })))
const AddManualPage = lazy(() => import('@/pages/AddManualPage').then(m => ({ default: m.AddManualPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <Routes>
          <Route element={<AppShell />}>
            <Route
              index
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <HomePage />
                </Suspense>
              }
            />
            <Route
              path="shelf/:shelfId"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <ShelfPage />
                </Suspense>
              }
            />
            <Route
              path="perfume/:perfumeId"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <PerfumePage />
                </Suspense>
              }
            />
            <Route
              path="search"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <SearchPage />
                </Suspense>
              }
            />
            <Route
              path="add"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <AddManualPage />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <SettingsPage />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
          </Routes>
        </AppErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
