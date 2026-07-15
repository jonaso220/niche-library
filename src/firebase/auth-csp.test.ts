import { describe, expect, it } from 'vitest'
import netlifyConfig from '../../netlify.toml?raw'

const csp = netlifyConfig.match(/Content-Security-Policy = "([^"]+)"/)?.[1]

function directive(name: string): string {
  return csp?.split(';').find(value => value.trim().startsWith(`${name} `)) ?? ''
}

describe('Firebase Auth production CSP', () => {
  it('allows the Google API script loaded by the popup resolver', () => {
    expect(directive('script-src')).toContain('https://apis.google.com')
  })

  it('allows the Firebase authentication iframe', () => {
    expect(directive('frame-src')).toContain('https://*.firebaseapp.com')
  })
})
