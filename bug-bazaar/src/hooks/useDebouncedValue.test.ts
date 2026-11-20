import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('alpha', 300))
    expect(result.current).toBe('alpha')
  })

  it('updates to the latest value only after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebouncedValue(value, delayMs),
      { initialProps: { value: 'a', delayMs: 300 } },
    )

    rerender({ value: 'ab', delayMs: 300 })
    rerender({ value: 'abc', delayMs: 300 })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('abc')
  })

  it('clears the pending timer on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'one' } },
    )

    rerender({ value: 'two' })
    unmount()

    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
