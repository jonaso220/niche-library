import { Outlet } from 'react-router'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border/50">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl shadow-black/50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6 lg:px-10 lg:py-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
