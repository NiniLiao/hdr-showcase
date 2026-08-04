import { describe, expect, it } from 'vitest'
import { isApiEndpoint } from './routing.js'

describe('isApiEndpoint', () => {
  it.each(['/api/services', '/api/services/water', '/api/stats', '/api/highlights', '/api/contact'])(
    'treats %s as an endpoint',
    (pathname) => {
      expect(isApiEndpoint(pathname)).toBe(true)
    },
  )

  it.each([
    '/api/_lib/types.ts',
    '/api/_lib/handlers.ts',
    '/api/_lib/data.ts',
    '/api/services/index.ts',
  ])('hands %s back to Vite as a source module', (pathname) => {
    expect(isApiEndpoint(pathname)).toBe(false)
  })

  it('ignores paths outside the api prefix', () => {
    expect(isApiEndpoint('/src/main.ts')).toBe(false)
    expect(isApiEndpoint('/')).toBe(false)
    expect(isApiEndpoint('/apidocs')).toBe(false)
  })
})
