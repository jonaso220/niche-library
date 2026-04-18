import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './config'
import { setCurrentUserId } from './auth-state'
import { syncOnLogin, syncOnLogout } from './sync'
import { AuthContext, type AuthContextValue } from './AuthContext'

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      // Legitimate init: mark auth as ready when Firebase isn't configured.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setCurrentUserId(firebaseUser?.uid ?? null)

      if (firebaseUser) {
        try {
          await syncOnLogin(firebaseUser.uid)
        } catch (err) {
          console.error('Error syncing on login:', err)
          setError(toMessage(err, 'No se pudo sincronizar tu colección. Revisa tu conexión.'))
        }
      } else {
        try {
          await syncOnLogout()
        } catch (err) {
          console.error('Error on logout cleanup:', err)
        }
      }

      setLoading(false)
    })

    return unsubscribe
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
