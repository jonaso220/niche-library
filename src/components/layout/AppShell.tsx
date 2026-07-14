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
    <div className="flex h-screen bg-background/90 overflow-hidden relative isolate">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,_rgba(23,74,57,0.11),_transparent_35%),radial-gradient(circle_at_62%_100%,_rgba(184,144,66,0.035),_transparent_34%)] pointer-events-none" />
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-[19rem] lg:flex-col lg:border-r lg:border-border/50 relative z-20">
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

        <main className="flex-1 overflow-y-auto px-5 pt-6 pb-28 sm:px-8 sm:pt-7 md:px-10 lg:px-12 xl:px-14 lg:pt-10 lg:pb-12">
          <div className="mx-auto w-full max-w-[108rem]">
            <Outlet />
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
