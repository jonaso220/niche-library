import { use } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  return use(AuthContext)
}
