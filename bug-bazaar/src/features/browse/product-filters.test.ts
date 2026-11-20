import { describe, expect, it } from 'vitest'
import {
  clearProductFilters,
  formatProductResultRange,
  hasActiveProductFilters,
  parseProductFilters,
  PRODUCTS_PAGE_SIZE,
  productFiltersToSearchParams,
  toProductQuery,
} from './productFilters'

describe('productFilters URL sync', () => {
  it('parses filters from search params', () => {
    const params = new URLSearchParams(
      'search=duck&category=ducks&sort=price-asc&inStock=true&page=2',
    )
    expect(parseProductFilters(params)).toEqual({
      search: 'duck',
      category: 'ducks',
      sort: 'price-asc',
      inStock: true,
      page: 2,
    })
  })

  it('ignores invalid category and sort values', () => {
    const params = new URLSearchParams('category=nope&sort=random')
    expect(parseProductFilters(params)).toEqual({
      search: '',
      category: undefined,
      sort: undefined,
      inStock: false,
      page: 1,
    })
  })

  it('omits default values when writing the URL', () => {
    const params = productFiltersToSearchParams({
      search: '',
      category: undefined,
      sort: undefined,
      inStock: false,
      page: 1,
    })
    expect(params.toString()).toBe('')
  })

  it('round-trips active filters through the query string', () => {
    const filters = {
      search: 'board',
      category: 'keyboards' as const,
      sort: 'name-asc' as const,
      inStock: true,
      page: 3,
    }
    const written = productFiltersToSearchParams(filters)
    expect(parseProductFilters(written)).toEqual(filters)
    expect(toProductQuery(filters)).toEqual({
      search: 'board',
      category: 'keyboards',
      sort: 'name-asc',
      inStock: true,
      page: 3,
    })
  })

  it('clear resets to defaults and reports inactive filters', () => {
    const cleared = clearProductFilters()
    expect(hasActiveProductFilters(cleared)).toBe(false)
    expect(productFiltersToSearchParams(cleared).toString()).toBe('')
  })

  it('formats the visible result range for the current page', () => {
    expect(formatProductResultRange(1, PRODUCTS_PAGE_SIZE, 5000)).toBe('Showing 1–20 of 5000')
    expect(formatProductResultRange(2, PRODUCTS_PAGE_SIZE, 5000)).toBe('Showing 21–40 of 5000')
    expect(formatProductResultRange(250, PRODUCTS_PAGE_SIZE, 5000)).toBe('Showing 4981–5000 of 5000')
    expect(formatProductResultRange(1, PRODUCTS_PAGE_SIZE, 0)).toBe('Showing 0 results')
  })
})
