import { z } from 'zod'

export const stockTickSchema = z.object({
  productId: z.string().min(1),
  stock: z.number().int().nonnegative(),
})

export type StockTick = z.infer<typeof stockTickSchema>
