import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBackToTop } from './useBackToTop'

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: y,
  })
}

describe('useBackToTop', () => {
  afterEach(() => {
    setScrollY(0)
    vi.restoreAllMocks()
  })

  it('is hidden near the top and visible past the threshold', () => {
    setScrollY(0)
    const { result } = renderHook(() => useBackToTop({ thresholdPx: 240 }))
    expect(result.current.isVisible).toBe(false)

    act(() => {
      setScrollY(241)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.isVisible).toBe(true)

    act(() => {
      setScrollY(100)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.isVisible).toBe(false)
  })

  it('scrollToTop calls window.scrollTo', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const { result } = renderHook(() => useBackToTop())

    act(() => {
      result.current.scrollToTop()
    })

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('removes the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useBackToTop({ thresholdPx: 100 }))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
