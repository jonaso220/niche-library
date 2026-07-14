import { Outlet } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { AuthErrorBanner } from './AuthErrorBanner'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!sidebarOpen) return
    const drawer = drawerRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const fallbackFocus = menuButtonRef.current
    drawer?.querySelector<HTMLElement>('[data-mobile-close]')?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSidebarOpen(false)
        return
      }
      if (event.key !== 'Tab' || !drawer) return
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      ;(previousFocus ?? fallbackFocus)?.focus()
    }
  }, [sidebarOpen])

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border/50">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl shadow-black/50"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10" inert={sidebarOpen}>
        <TopBar menuButtonRef={menuButtonRef} onMenuClick={() => setSidebarOpen(true)} />
        <AuthErrorBanner />

        <main className="flex-1 overflow-y-auto px-6 pt-5 pb-24 sm:px-8 sm:pt-6 md:px-10 md:pt-7 lg:px-12 lg:pt-8 lg:pb-10">
          <Outlet />
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
