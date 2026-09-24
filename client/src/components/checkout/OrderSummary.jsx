import { formatBDT } from '../../utils/format.js';

export default function OrderSummary({ items, subtotal, shippingCost, total }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display text-lg font-bold">Order Summary</h3>
      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={`${item.productId}:${item.variantId}`} className="flex items-center gap-3">
            <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg bg-brand-50 object-cover" />
            <div className="flex-1">
              <p className="line-clamp-1 text-sm font-medium text-stone-900">{item.name}</p>
              <p className="text-xs text-stone-500">
                {item.variantLabel} × {item.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold">{formatBDT(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Shipping</span>
          <span>{shippingCost != null ? formatBDT(shippingCost) : '—'}</span>
        </div>
        <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-900">
          <span>Total</span>
          <span>{total != null ? formatBDT(total) : '—'}</span>
        </div>
      </div>
    </div>
  );
}
