import { useEffect, useState } from 'react'

export type UseBackToTopOptions = {
  /** Show the control after the window scrolls past this many pixels. */
  thresholdPx?: number
}

export type UseBackToTopResult = {
  isVisible: boolean
  scrollToTop: () => void
}

const DEFAULT_THRESHOLD_PX = 240

/**
 * Window scroll visibility + scroll-to-top helper for a Back to Top control.
 * Cleans up the scroll listener on unmount. Not tied to any route or product id.
 */
export function useBackToTop(options: UseBackToTopOptions = {}): UseBackToTopResult {
  const thresholdPx = options.thresholdPx ?? DEFAULT_THRESHOLD_PX
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > thresholdPx)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [thresholdPx])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { isVisible, scrollToTop }
}
