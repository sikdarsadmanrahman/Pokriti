import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useGetProductBySlugQuery } from '../api/publicApi.js';
import { addItem } from '../app/cartSlice.js';
import { useToast } from '../components/common/ToastContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import StockBadge from '../components/product/StockBadge.jsx';
import { formatBDT, formatWeight } from '../utils/format.js';
import { defaultVariant, productImage } from '../utils/productHelpers.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useGetProductBySlugQuery(slug);
  const dispatch = useDispatch();
  const toast = useToast();
  const [variantId, setVariantId] = useState();
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v._id === variantId) || defaultVariant(product);
  }, [product, variantId]);

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!product) return <div className="container-x py-24 text-center text-stone-500">Product not found.</div>;

  const handleAdd = () => {
    if (!variant?.inStock) return;
    dispatch(
      addItem({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        image: productImage(product),
        variantLabel: variant.label,
        price: variant.currentPrice,
        maxQuantity: 20,
        quantity: qty,
      })
    );
    toast?.success(`Added ${qty} × ${product.name} (${variant.label}) to cart`);
    setQty(1);
  };

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-sm text-stone-500">
        <Link to="/shop" className="hover:text-brand-700">Shop</Link> / {product.category?.name && <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-700">{product.category.name}</Link>} / <span className="text-stone-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
            <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.slice(0, 5).map((img) => (
                <img key={img.publicId || img.url} src={img.url} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-stone-200" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            {product.category?.name && <span className="badge bg-brand-100 text-brand-700">{product.category.name}</span>}
            <StockBadge isOutOfStock={product.isOutOfStock} lowStock={variant?.lowStock} />
          </div>
          <h1 className="font-display text-3xl font-bold text-stone-900">{product.name}</h1>
          {product.shortDescription && <p className="mt-2 text-stone-600">{product.shortDescription}</p>}

          <div className="mt-5 flex items-baseline gap-2">
            {variant?.onSale && <span className="text-lg text-stone-400 line-through">{formatBDT(variant.price)}</span>}
            <span className="font-display text-3xl font-bold text-brand-800">{variant ? formatBDT(variant.currentPrice) : '—'}</span>
          </div>

          {product.variants.length > 1 && (
            <div className="mt-5">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    disabled={!v.inStock}
                    onClick={() => setVariantId(v._id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      (variantId || defaultVariant(product)?._id) === v._id ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300'
                    }`}
                  >
                    {v.label || formatWeight(v.weightInGrams)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-stone-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-stone-600 hover:text-brand-700" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-3 text-stone-600 hover:text-brand-700" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={handleAdd} disabled={!variant?.inStock} className="btn-primary flex-1">
              <ShoppingCart size={18} /> {variant?.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-stone-100 pt-6">
              <h3 className="mb-2 font-semibold text-stone-900">Description</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{product.description}</p>
            </div>
          )}

          {product.origin && (
            <div className="mt-6 rounded-xl bg-brand-50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-brand-800">Sourcing & Origin</h3>
              <p className="text-sm text-brand-700">{product.origin}</p>
            </div>
          )}

          {product.isCombo && product.comboItems?.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="mb-2 font-semibold text-stone-900">This bundle includes</h3>
              <ul className="space-y-1 text-sm text-stone-600">
                {product.comboItems.map((ci, i) => (
                  <li key={i}>
                    • {ci.product?.name} {ci.variantLabel && `(${ci.variantLabel})`} × {ci.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
