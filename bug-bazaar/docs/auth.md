# Auth storage

## Where the token lives

The Bug Bazaar keeps the Bearer token **in memory only**, via `setAuthToken` / `getAuthToken` / `logout` in `src/api/client.ts`.

- Redux `session` stores the **user profile** (`id`, `email`, `name`) for UI — never the token.
- Cart may use `localStorage` (it is not a credential).
- The token is **never** written to `localStorage`, `sessionStorage`, or cookies by this app.

## Trade-off: memory vs `localStorage`

| Approach | Upside | Downside |
| --- | --- | --- |
| **In-memory token (chosen)** | Harder for XSS to persist a stolen credential across reloads; refresh always starts signed out; matches the training contract | Users must sign in again after every full page reload or new tab |
| **`localStorage` token** | Survives reload; convenient “stay signed in” | Any XSS can read the token later; longer-lived theft window |

We accept the inconvenience of re-login after reload in exchange for not persisting credentials in web storage. If a 401 arrives on an authenticated request, the client clears the in-memory token and notifies the app so Redux session is cleared too.
