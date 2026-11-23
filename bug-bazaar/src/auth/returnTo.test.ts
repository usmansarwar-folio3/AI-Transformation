import { describe, expect, it } from 'vitest'
import { resolveReturnTo } from './returnTo'

describe('resolveReturnTo', () => {
  it('prefers a safe location from router state', () => {
    expect(
      resolveReturnTo({
        from: { pathname: '/cart', search: '', hash: '', state: null, key: '1' },
      }),
    ).toBe('/cart')
  })

  it('accepts a from query param', () => {
    expect(resolveReturnTo(null, new URLSearchParams('from=/account'))).toBe('/account')
  })

  it('rejects open redirects', () => {
    expect(resolveReturnTo(null, new URLSearchParams('from=//evil.example'))).toBe('/')
    expect(
      resolveReturnTo({
        from: {
          pathname: '//evil.example',
          search: '',
          hash: '',
          state: null,
          key: '1',
        },
      }),
    ).toBe('/')
  })
})
