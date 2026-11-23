import { PRODUCTS_PAGE_SIZE } from '../api/pagination'
import type { Product, ProductCategory } from '../api/schemas'
import { productCategorySchema } from '../api/schemas'

export const PRODUCT_COUNT = 5000
export { PRODUCTS_PAGE_SIZE }

const CATEGORIES = productCategorySchema.options

const ADJECTIVES = [
  'Harbor',
  'Cedar',
  'Amber',
  'Midnight',
  'Copper',
  'Forest',
  'Solar',
  'Nimbus',
  'Marble',
  'Velvet',
  'Rusty',
  'Polar',
  'Crimson',
  'Glacier',
  'Honey',
  'Indigo',
  'Mossy',
  'Pine',
  'Quartz',
  'Saffron',
  'Tidal',
  'Umber',
  'Vivid',
  'Woven',
  'Azure',
  'Bronze',
  'Coral',
  'Dusk',
  'Ember',
  'Flint',
  'Golden',
  'Hazel',
  'Ivory',
  'Jade',
  'Keen',
  'Lunar',
  'Maple',
  'Neon',
  'Olive',
  'Pearl',
] as const

const PRODUCT_NOUNS: Record<ProductCategory, readonly string[]> = {
  ducks: [
    'Rubber Duck',
    'Desk Duck',
    'Debug Duck',
    'Bath Duck',
    'Buddy Duck',
    'Pixel Duck',
    'Quack Companion',
    'Code Duck',
    'Focus Duck',
    'Sprint Duck',
    'Standup Duck',
    'Retro Duck',
    'Ship Duck',
    'Bug Duck',
    'Float Duck',
    'Mascot Duck',
    'Pair Duck',
    'Review Duck',
    'Quiet Duck',
    'Happy Duck',
    'Lucky Duck',
    'Tiny Duck',
    'Giant Duck',
    'Chrome Duck',
    'Matte Duck',
    'Classic Duck',
    'Office Duck',
    'Travel Duck',
    'Night Duck',
    'Morning Duck',
    'Weekend Duck',
    'Deploy Duck',
    'Merge Duck',
    'Branch Duck',
  ],
  keyboards: [
    'Tactile Keyboard',
    'Linear Keyboard',
    'Clicky Keyboard',
    'Tenkeyless Board',
    'Ortho Board',
    'Hotswap Board',
    'Compact Keyboard',
    'Fullsize Board',
    'Travel Keyboard',
    'Silent Keyboard',
    'RGB Keyboard',
    'Aluminum Board',
    'Woodcase Board',
    'Foam-Lined Board',
    'Gasket Board',
    'Alice Keyboard',
    'Split Keyboard',
    'Mac Layout Board',
    'Programmable Board',
    'Wireless Keyboard',
    'PBT Keycap Set',
    'Switch Tester',
    'Deskmat Board',
    'Low-Profile Board',
    'Typewriter Board',
    'Ergo Keyboard',
    'Numpad Module',
    'Knob Keyboard',
    'Craft Keyboard',
    'Studio Keyboard',
    'Lab Keyboard',
    'Forge Keyboard',
    'Summit Keyboard',
    'Harbor Board',
  ],
  coffee: [
    'Pour-Over',
    'Espresso Blend',
    'Cold Brew Kit',
    'French Press',
    'Mug Set',
    'Roast Pack',
    'Single Origin',
    'Drip Kit',
    'Travel Tumbler',
    'Bean Sampler',
    'Aero Press',
    'Latte Blend',
    'Dark Roast',
    'Light Roast',
    'House Blend',
    'Morning Brew',
    'Desk Mug',
    'Ceramic Cup',
    'Filter Bundle',
    'Barista Kit',
    'Grind Set',
    'Steam Pitcher',
    'Brew Scale',
    'Kettle Set',
    'Office Roast',
    'Weekend Blend',
    'Night Cap Roast',
    'Sprint Fuel',
    'Review Roast',
    'Ship Day Blend',
    'Standup Brew',
    'Focus Roast',
    'Pair Brew',
    'Retro Roast',
  ],
  stickers: [
    'Sticker Sheet',
    'Laptop Decal',
    'Semicolon Pack',
    'Bug Badge Set',
    'Emoji Pack',
    'Holographic Sheet',
    'Vinyl Decal',
    'Code Quote Pack',
    'Patch Sticker',
    'Icon Sheet',
    'Gloss Pack',
    'Matte Pack',
    'Die-Cut Set',
    'Clear Sticker',
    'Foil Sheet',
    'Team Badge Pack',
    'Ship It Decal',
    'Merge Sticker',
    'PR Badge',
    'CI Seal Pack',
    'Debug Decal',
    'Pixel Pack',
    'Retro Sheet',
    'Neon Decal',
    'Classic Pack',
    'Office Sheet',
    'Travel Pack',
    'Desk Decal',
    'Monitor Sticker',
    'Keyboard Decal',
    'Mug Sticker',
    'Case Pack',
    'Window Decal',
    'Notebook Pack',
  ],
}

const IMAGE_BY_CATEGORY: Record<ProductCategory, readonly string[]> = {
  ducks: ['/products/duck-1.svg', '/products/duck-2.svg', '/products/duck-3.svg'],
  keyboards: ['/products/keyboard-1.svg', '/products/keyboard-2.svg', '/products/keyboard-3.svg'],
  coffee: ['/products/coffee-1.svg', '/products/coffee-2.svg', '/products/coffee-3.svg'],
  stickers: ['/products/sticker-1.svg', '/products/sticker-2.svg', '/products/sticker-3.svg'],
}

/**
 * Deterministic catalog of 5,000 products.
 * `p-0002` always has stock 0 so checkout can trigger 409 on purpose.
 */
export function createProductCatalog(): Product[] {
  const usedNames = new Set<string>()

  const products: Product[] = Array.from({ length: PRODUCT_COUNT }, (_, index) => {
    const n = index + 1
    const category = CATEGORIES[index % CATEGORIES.length]!
    const isOutOfStock = n === 2
    const name = uniqueProductName(category, index, usedNames)
    const images = IMAGE_BY_CATEGORY[category]

    return {
      id: `p-${String(n).padStart(4, '0')}`,
      name,
      price: 199 + (n % 400) * 25,
      category,
      stock: isOutOfStock ? 0 : (n % 40) + 1,
      rating: Number(((n % 50) / 10).toFixed(1)),
      imageUrl: images[index % images.length]!,
    }
  })

  return products
}

function uniqueProductName(
  category: ProductCategory,
  index: number,
  usedNames: Set<string>,
): string {
  const nouns = PRODUCT_NOUNS[category]
  const baseCombos = ADJECTIVES.length * nouns.length
  const comboIndex = Math.floor(index / CATEGORIES.length) % baseCombos
  const adjective = ADJECTIVES[comboIndex % ADJECTIVES.length]!
  const noun = nouns[Math.floor(comboIndex / ADJECTIVES.length) % nouns.length]!
  let name = `${adjective} ${noun}`

  if (usedNames.has(name)) {
    const series = Math.floor(index / CATEGORIES.length) + 1
    name = `${adjective} ${noun} ${series}`
  }

  usedNames.add(name)
  return name
}

export const productCatalog = createProductCatalog()

/** Stable out-of-stock product used for intentional 409s. */
export const outOfStockProduct = productCatalog[1]!
