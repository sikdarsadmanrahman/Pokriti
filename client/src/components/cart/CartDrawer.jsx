import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { closeCart, selectCartIsOpen, selectCartItems, selectCartSubtotal } from '../../app/cartSlice.js';
import CartLineItem from './CartLineItem.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatBDT } from '../../utils/format.js';

/** Slide-over cart (right-side drawer). Shipping/total are computed on the checkout page from live zone selection. */
export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCartIsOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => dispatch(closeCart())} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Your Cart ({items.length})</h2>
          <button onClick={() => dispatch(closeCart())} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="pt-10">
              <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add some fresh, organic goodness to get started." />
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <CartLineItem key={`${item.productId}:${item.variantId}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-100 p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="text-lg font-bold text-stone-900">{formatBDT(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-stone-400">Shipping is calculated at checkout based on your delivery area.</p>
            <Link to="/checkout" onClick={() => dispatch(closeCart())} className="btn-primary w-full">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
