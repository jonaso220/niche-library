// Module-level auth state for non-React code (e.g., hooks.ts mutations)
let _currentUserId: string | null = null

export function setCurrentUserId(id: string | null) {
  _currentUserId = id
}

export function getCurrentUserId(): string | null {
  return _currentUserId
}
