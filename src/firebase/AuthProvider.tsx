import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, firebaseReady, googleProvider, isFirebaseConfigured } from './config'
import { setCurrentUserId } from './auth-state'
import { syncOnLogin, syncOnLogout } from './sync'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { initializeLocalDatabase } from '@/db/bootstrap'

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const previousUserId = useRef<string | null>(null)

  useEffect(() => {
    initializeLocalDatabase().catch(err => {
      console.error('Error initializing local database:', err)
      setError(toMessage(err, 'No se pudo inicializar el catálogo local.'))
    })

    let cancelled = false
    let unsubscribe = () => {}

    void firebaseReady.then(() => {
      if (cancelled) return
      if (!auth || !isFirebaseConfigured) {
        setLoading(false)
        return
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        const signedOutUserId = previousUserId.current
        setUser(firebaseUser)
        setCurrentUserId(firebaseUser?.uid ?? null)

        if (firebaseUser) {
          try {
            await syncOnLogin(firebaseUser.uid)
          } catch (err) {
            console.error('Error syncing on login:', err)
            setError(toMessage(err, 'No se pudo sincronizar tu colección. Revisa tu conexión.'))
          }
          previousUserId.current = firebaseUser.uid
        } else if (signedOutUserId) {
          try {
            await syncOnLogout()
          } catch (err) {
            console.error('Error on logout cleanup:', err)
          }
          previousUserId.current = null
        }

        if (!cancelled) setLoading(false)
      })
    }).catch(err => {
      console.error('Error initializing Firebase:', err)
      if (!cancelled) {
        setError(toMessage(err, 'No se pudo inicializar Firebase.'))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    if (!auth) {
      setError('Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.')
      return
    }
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(toMessage(err, 'No se pudo iniciar sesión con Google.'))
    }
  }

  async function handleSignOut() {
    if (!auth) return
    setError(null)
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
      setError(toMessage(err, 'No se pudo cerrar sesión.'))
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      error,
      clearError: () => setError(null),
      signInWithGoogle,
      signOut: handleSignOut,
    }),
    [user, loading, error],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
