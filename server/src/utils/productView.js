import { effectivePrice } from './pricing.js';

/**
 * Adds computed fields (currentPrice, onSale, inStock, isOutOfStock) to a lean product.
 * Public view hides exact stock numbers; admin view keeps them.
 */
export function decorateProduct(p, { admin = false, now = new Date() } = {}) {
  const variants = (p.variants || []).map((v) => {
    const currentPrice = effectivePrice(p, v, now);
    const inStock = v.isActive !== false && v.stock > 0;
    const view = { ...v, currentPrice, onSale: currentPrice < v.price, inStock };
    if (!admin) {
      view.lowStock = inStock && v.stock <= (p.lowStockThreshold ?? 5);
      delete view.stock;
    }
    return view;
  });

  const isOutOfStock = !variants.some((v) => v.inStock);

  if (admin) {
    return { ...p, variants, isOutOfStock, isLowStock: !isOutOfStock && p.totalStock <= p.lowStockThreshold };
  }
  // eslint-disable-next-line no-unused-vars
  const { totalStock, lowStockThreshold, soldCount, ...publicFields } = p;
  return { ...publicFields, variants, isOutOfStock };
}
