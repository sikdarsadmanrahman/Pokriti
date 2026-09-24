import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBasket } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addItem } from '../../app/cartSlice.js';
import { useToast } from '../common/ToastContext.jsx';
import { formatBDT, formatWeight } from '../../utils/format.js';
import { defaultVariant, productImage } from '../../utils/productHelpers.js';
import StockBadge from './StockBadge.jsx';

/** Storefront product card: image, title, short description, category tag, weight selector, quick add. */
export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState(defaultVariant(product)?._id);
  const variant = useMemo(() => product.variants.find((v) => v._id === variantId), [product.variants, variantId]);

  const handleAdd = () => {
    if (!variant || !variant.inStock) return;
    dispatch(
      addItem({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        image: productImage(product),
        variantLabel: variant.label,
        price: variant.currentPrice,
        maxQuantity: 20,
      })
    );
    toast?.success(`Added ${product.name} (${variant.label}) to cart`);
  };

  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brand-50">
        <img src={productImage(product)} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <StockBadge isOutOfStock={product.isOutOfStock} lowStock={variant?.lowStock} />
          {variant?.onSale && <span className="badge bg-honey-500 text-honey-950">Sale</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="line-clamp-1 font-display text-base font-semibold text-stone-900">{product.name}</h3>
        </Link>
        {product.shortDescription && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{product.shortDescription}</p>}

        {inStockVariants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <button
                key={v._id}
                disabled={!v.inStock}
                onClick={() => setVariantId(v._id)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  v._id === variantId ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300'
                }`}
              >
                {v.label || formatWeight(v.weightInGrams)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            {variant?.onSale && <span className="mr-1.5 text-xs text-stone-400 line-through">{formatBDT(variant.price)}</span>}
            <span className="font-display text-lg font-bold text-brand-800">{variant ? formatBDT(variant.currentPrice) : '—'}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!variant?.inStock}
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-stone-200 disabled:text-stone-400"
          >
            {variant?.inStock ? <Plus size={18} /> : <ShoppingBasket size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
