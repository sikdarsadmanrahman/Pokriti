export default function StockBadge({ isOutOfStock, lowStock }) {
  if (isOutOfStock) return <span className="badge bg-stone-800/90 text-white">Out of Stock</span>;
  if (lowStock) return <span className="badge bg-honey-100 text-honey-700">Only a few left</span>;
  return null;
}
