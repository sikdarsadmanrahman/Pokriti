/** A sale is live if we're inside the (optional) product-level sale window. */
export function isSaleActive(product, now = new Date()) {
  if (product.saleStartsAt && now < new Date(product.saleStartsAt)) return false;
  if (product.saleEndsAt && now > new Date(product.saleEndsAt)) return false;
  return true;
}

/** The price a customer actually pays for a variant right now. */
export function effectivePrice(product, variant, now = new Date()) {
  const onSale = variant.salePrice != null && variant.salePrice < variant.price && isSaleActive(product, now);
  return onSale ? variant.salePrice : variant.price;
}
