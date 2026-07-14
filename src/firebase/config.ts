import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
const missingKeys = REQUIRED_KEYS.filter(k => !firebaseConfig[k])
const hasAnyConfig = REQUIRED_KEYS.some(k => !!firebaseConfig[k])
const hasConfig = missingKeys.length === 0

if (hasAnyConfig && !hasConfig) {
  // Partial config: warn so silent failures are visible in DevTools.
  console.warn(
    `[firebase] Missing env vars: ${missingKeys.map(k => `VITE_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}. Cloud sync disabled.`,
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let firestore: Firestore | null = null
let firebaseReady: Promise<void> = Promise.resolve()

if (hasConfig) {
  app = initializeApp(firebaseConfig)
  const rawAppCheckSiteKey: unknown = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY
  firebaseReady = (async () => {
    if (typeof rawAppCheckSiteKey === 'string' && rawAppCheckSiteKey) {
      const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check')
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(rawAppCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
    }
    auth = getAuth(app)
    firestore = getFirestore(app)
  })()
}

export const googleProvider = new GoogleAuthProvider()
export const isFirebaseConfigured = hasConfig
export { app, auth, firestore, firebaseReady }
