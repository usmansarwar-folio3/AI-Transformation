/**
 * Bridge so the API client can clear Redux session on 401 without importing the store
 * (avoids a client ↔ store cycle). Registered once from the app root.
 */
type UnauthorizedListener = () => void

const listeners = new Set<UnauthorizedListener>()

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyUnauthorized(): void {
  for (const listener of listeners) {
    listener()
  }
}
