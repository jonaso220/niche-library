import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './config'
import { setCurrentUserId } from './auth-state'
import { syncOnLogin, syncOnLogout } from './sync'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
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
        }
      } else {
        syncOnLogout()
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    if (!auth) return
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google sign-in error:', err)
    }
  }

  async function handleSignOut() {
    if (!auth) return
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      signInWithGoogle,
      signOut: handleSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
