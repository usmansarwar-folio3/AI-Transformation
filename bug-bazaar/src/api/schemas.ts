import { z } from 'zod'

/** Matches docs/api-contract.md product categories. */
export const productCategorySchema = z.enum(['keyboards', 'ducks', 'coffee', 'stickers'])

/** Matches docs/api-contract.md sort query values. */
export const productSortSchema = z.enum(['price-asc', 'price-desc', 'name-asc', 'rating-desc'])

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Price in cents. */
  price: z.number().int().nonnegative(),
  category: productCategorySchema,
  stock: z.number().int().nonnegative(),
  rating: z.number().nonnegative(),
  imageUrl: z.string().min(1),
})

export const productListSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().nonnegative(),
})

/** Matches docs/api-contract.md ApiError. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.record(z.string(), z.string()).optional(),
  }),
})

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
})

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
})

export const orderCreatedSchema = z.object({
  id: z.string().min(1),
  status: z.literal('queued'),
})

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
})

export type ProductCategory = z.infer<typeof productCategorySchema>
export type ProductSort = z.infer<typeof productSortSchema>
export type Product = z.infer<typeof productSchema>
export type ProductList = z.infer<typeof productListSchema>
/** Contract name from docs/api-contract.md. */
export type ApiError = z.infer<typeof apiErrorSchema>
/** @deprecated Prefer ApiError — kept for existing client imports. */
export type ApiErrorBody = ApiError
export type User = z.infer<typeof userSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type OrderCreated = z.infer<typeof orderCreatedSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
