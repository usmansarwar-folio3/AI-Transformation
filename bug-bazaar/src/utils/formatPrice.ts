/**
 * Display-layer helper. API prices stay in cents until here.
 */
export function formatPriceFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
