/** Picks the cheapest in-stock variant to show as a card's default "from" price and selector default. */
export function defaultVariant(product) {
  const active = (product.variants || []).filter((v) => v.inStock);
  const pool = active.length ? active : product.variants || [];
  return pool.reduce((min, v) => (min == null || v.currentPrice < min.currentPrice ? v : min), null);
}

export const productImage = (product) => product.images?.[0]?.url || '/placeholder-product.svg';
