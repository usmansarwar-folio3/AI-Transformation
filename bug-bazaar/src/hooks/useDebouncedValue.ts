import { useEffect, useState } from 'react'

/**
 * Returns `value` delayed by `delayMs`. Clears the pending timer on change/unmount.
 * Generic — not tied to search or any feature.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [value, delayMs])

  return debounced
}
