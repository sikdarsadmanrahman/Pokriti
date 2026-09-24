import { Minus, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from '../../app/cartSlice.js';
import { formatBDT } from '../../utils/format.js';

export default function CartLineItem({ item }) {
  const dispatch = useDispatch();
  const setQty = (quantity) => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity }));

  return (
    <div className="flex gap-3 py-4">
      <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-brand-50 object-cover" />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="line-clamp-1 text-sm font-semibold text-stone-900">{item.name}</p>
            <p className="text-xs text-stone-500">{item.variantLabel}</p>
          </div>
          <button
            onClick={() => dispatch(removeItem({ productId: item.productId, variantId: item.variantId }))}
            className="text-stone-400 hover:text-red-500"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-stone-200">
            <button onClick={() => setQty(item.quantity - 1)} className="p-1.5 text-stone-600 hover:text-brand-700" aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
            <button
              onClick={() => setQty(item.quantity + 1)}
              disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
              className="p-1.5 text-stone-600 hover:text-brand-700 disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-sm font-bold text-stone-900">{formatBDT(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
