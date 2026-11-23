type ReportableError = {
  message: string
  name?: string
}

/**
 * Single place for unexpected UI errors. Never log tokens or raw API bodies.
 */
export function reportError(error: unknown, context?: string): void {
  const safe =
    error instanceof Error
      ? ({ message: error.message, name: error.name } satisfies ReportableError)
      : ({ message: 'Unknown error' } satisfies ReportableError)

  const prefix = context ? `[Bug Bazaar:${context}]` : '[Bug Bazaar]'
  console.error(prefix, safe.name ?? 'Error', safe.message)
}
