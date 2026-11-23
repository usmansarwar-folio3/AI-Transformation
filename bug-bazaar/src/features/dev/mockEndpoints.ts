export type MockHttpMethod = 'GET' | 'POST'

export type MockEndpointError = {
  status: number
  how: string
  tryPath?: string
  tryLabel?: string
}

export type MockEndpoint = {
  method: MockHttpMethod
  path: string
  successStatus: number
  successSummary: string
  errors: MockEndpointError[]
}

/** Contract endpoints only — keep in sync with docs/api-contract.md. */
export const mockEndpoints: MockEndpoint[] = [
  {
    method: 'GET',
    path: '/api/products?search=&category=&sort=&page=&inStock=',
    successStatus: 200,
    successSummary: '{ items: Product[], total: number }',
    errors: [
      {
        status: 500,
        how: 'Add query forceError=500',
        tryPath: '/?forceError=500',
        tryLabel: 'Open list with 500',
      },
      {
        status: 200,
        how: 'Race demo: add slow=1 so shorter searches finish later',
        tryPath: '/?slow=1',
        tryLabel: 'Open slow list',
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    successStatus: 200,
    successSummary: 'Product',
    errors: [
      {
        status: 404,
        how: 'Use an unknown id such as missing',
        tryPath: '/products/missing',
        tryLabel: 'Open missing product',
      },
    ],
  },
  {
    method: 'POST',
    path: '/api/login',
    successStatus: 200,
    successSummary: '{ token, user }',
    errors: [
      {
        status: 400,
        how: 'Omit email and/or password',
        tryPath: '/login',
        tryLabel: 'Open login',
      },
      {
        status: 401,
        how: 'Wrong password (anything other than password)',
        tryPath: '/login',
        tryLabel: 'Open login',
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/me',
    successStatus: 200,
    successSummary: 'User',
    errors: [
      {
        status: 401,
        how: 'Call without a Bearer token (sign out, then open Account)',
        tryPath: '/account',
        tryLabel: 'Open account',
      },
    ],
  },
  {
    method: 'POST',
    path: '/api/orders',
    successStatus: 201,
    successSummary: '{ id, status: "queued" }',
    errors: [
      {
        status: 400,
        how: 'Empty items, missing idempotency key, or invalid line items',
      },
      {
        status: 401,
        how: 'Call without a Bearer token',
        tryPath: '/cart',
        tryLabel: 'Open cart',
      },
      {
        status: 409,
        how: 'Checkout product p-0002 (always out of stock)',
        tryPath: '/cart',
        tryLabel: 'Open cart for 409',
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/orders/:id',
    successStatus: 200,
    successSummary: '{ id, status }',
    errors: [
      {
        status: 401,
        how: 'Call without a Bearer token',
      },
      {
        status: 404,
        how: 'Unknown order id such as missing',
      },
    ],
  },
]
