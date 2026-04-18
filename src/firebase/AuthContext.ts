import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  clearError: () => {},
  signInWithGoogle: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
})
