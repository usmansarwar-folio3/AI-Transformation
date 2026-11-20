import { http, HttpResponse } from 'msw'
import type { Product } from '../../api/schemas'

const sampleProduct: Product = {
  id: 'p-1',
  name: 'Rubber Duck',
  price: 999,
  category: 'ducks',
  stock: 12,
  rating: 4.5,
  imageUrl: '/duck.png',
}

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({ items: [sampleProduct], total: 1 })
  }),
  http.get('/api/products/:id', ({ params }) => {
    if (params.id !== sampleProduct.id) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(sampleProduct)
  }),
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION', message: 'Missing credentials' } },
        { status: 400 },
      )
    }
    if (body.password !== 'secret') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      token: 'test-token',
      user: { id: 'u-1', email: body.email, name: 'Test User' },
    })
  }),
  http.get('/api/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not signed in' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({ id: 'u-1', email: 'dev@example.com', name: 'Test User' })
  }),
  http.post('/api/orders', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not signed in' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({ id: 'o-1', status: 'queued' }, { status: 201 })
  }),
  http.get('/api/orders/:id', ({ params, request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not signed in' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({ id: params.id, status: 'queued' })
  }),
]
