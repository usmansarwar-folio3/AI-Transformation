import { useQuery } from '@tanstack/react-query'
import {
  getMe,
  getOrder,
  getProduct,
  getProducts,
  type ProductQuery,
} from '../api'
import { orderKeys, productKeys, userKeys } from './keys'

export function useProductsQuery(query: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: ({ signal }) => getProducts(query, signal),
  })
}

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) => getProduct(productId, signal),
    enabled: productId.length > 0,
  })
}

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: ({ signal }) => getMe(signal),
    enabled,
  })
}

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => getOrder(orderId, signal),
    enabled: orderId.length > 0,
    staleTime: Infinity,
  })
}
