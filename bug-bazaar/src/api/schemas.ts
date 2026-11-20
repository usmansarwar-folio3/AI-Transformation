import { z } from 'zod'

export const productCategorySchema = z.enum(['keyboards', 'ducks', 'coffee', 'stickers'])

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  category: productCategorySchema,
  stock: z.number().int().nonnegative(),
  rating: z.number(),
  imageUrl: z.string(),
})

export const productListSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().nonnegative(),
})

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()).optional(),
  }),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
})

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
})

export const orderCreatedSchema = z.object({
  id: z.string(),
  status: z.literal('queued'),
})

export const orderStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
})

export type Product = z.infer<typeof productSchema>
export type ProductList = z.infer<typeof productListSchema>
export type ApiErrorBody = z.infer<typeof apiErrorSchema>
export type User = z.infer<typeof userSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type OrderCreated = z.infer<typeof orderCreatedSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
